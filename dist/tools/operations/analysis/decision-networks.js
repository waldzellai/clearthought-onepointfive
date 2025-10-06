import { BaseOperation } from "../base.js";
export class DecisionNetworksOperation extends BaseOperation {
    name = "decision_networks";
    category = "analysis";
    async execute(context) {
        const params = this.normalizeParameters(context.parameters);
        this.validateParametersInternal(params);
        const expectedUtilities = {};
        const traces = [];
        for (const decision of params.decision.states) {
            const { expectedUtility, rawUtility, evidenceProbability, enumerationCount } = this.computeExpectedUtility(decision, params);
            expectedUtilities[decision] = expectedUtility;
            traces.push({ decision, expectedUtility, rawUtility, evidenceProbability, enumerationCount });
        }
        const bestDecision = Object.entries(expectedUtilities).reduce((best, [decision, utility]) => {
            if (!best || utility > best.utility) {
                return { decision, utility };
            }
            return best;
        }, undefined);
        return this.createResult({
            prompt: context.prompt,
            decisionVariable: params.decision.name,
            bestDecision,
            expectedUtilities,
            traces,
            assumptions: {
                model: "decision_network",
                solver: "enumeration",
                evidence: params.evidence ?? {},
            },
        });
    }
    normalizeParameters(raw) {
        return {
            randomVariables: this.parseRandomVariables(raw.randomVariables),
            decision: this.parseDecision(raw.decision),
            utilityNodes: this.parseUtilityNodes(raw.utilityNodes),
            evidence: this.parseAssignment(raw.evidence),
        };
    }
    parseRandomVariables(value) {
        if (!Array.isArray(value) || value.length === 0) {
            throw new Error("decision_networks requires randomVariables array");
        }
        return value.map((item) => {
            const variable = item;
            const name = String(variable.name);
            const states = this.toStringArray(variable.states, `randomVariables[${name}].states`);
            const parents = variable.parents
                ? this.toStringArray(variable.parents, `randomVariables[${name}].parents`)
                : undefined;
            const cpt = this.parseProbabilityRows(variable.cpt, name);
            return { name, states, parents, cpt };
        });
    }
    parseProbabilityRows(value, variableName) {
        if (!Array.isArray(value) || value.length === 0) {
            throw new Error(`decision_networks requires cpt entries for ${variableName}`);
        }
        return value.map((row) => {
            const entry = row;
            const when = this.parseAssignment(entry.when) ?? {};
            const distribution = this.parseDistribution(entry.distribution, variableName, when);
            return { when, distribution };
        });
    }
    parseDistribution(value, variableName, when) {
        if (!value || typeof value !== "object") {
            throw new Error(`Invalid distribution for ${variableName}`);
        }
        const distribution = {};
        for (const [state, probabilityValue] of Object.entries(value)) {
            const probability = Number(probabilityValue);
            if (Number.isNaN(probability) || probability < 0 || probability > 1) {
                throw new Error(`Probability for ${variableName} (${state}) must be between 0 and 1`);
            }
            distribution[state] = probability;
        }
        const total = Object.values(distribution).reduce((sum, p) => sum + p, 0);
        if (Math.abs(total - 1) > 1e-6) {
            throw new Error(`Distribution for ${variableName} (when ${JSON.stringify(when)}) must sum to 1`);
        }
        return distribution;
    }
    parseDecision(value) {
        if (!value || typeof value !== "object") {
            throw new Error("decision_networks requires decision object");
        }
        const record = value;
        return {
            name: String(record.name),
            states: this.toStringArray(record.states, "decision.states"),
        };
    }
    parseUtilityNodes(value) {
        if (!Array.isArray(value) || value.length === 0) {
            throw new Error("decision_networks requires utilityNodes array");
        }
        return value.map((node) => {
            const entry = node;
            const tableValue = entry.table;
            if (!Array.isArray(tableValue) || tableValue.length === 0) {
                throw new Error("utility node requires non-empty table");
            }
            const table = tableValue.map((row) => {
                const r = row;
                return {
                    when: this.parseAssignment(r.when) ?? {},
                    value: Number(r.value ?? r.utility ?? 0),
                };
            });
            return {
                name: String(entry.name ?? "utility"),
                table,
            };
        });
    }
    parseAssignment(value) {
        if (!value)
            return undefined;
        if (typeof value !== "object") {
            throw new Error("Assignment must be an object");
        }
        const assignment = {};
        for (const [key, state] of Object.entries(value)) {
            assignment[key] = String(state);
        }
        return assignment;
    }
    toStringArray(value, field) {
        if (!Array.isArray(value) || value.length === 0) {
            throw new Error(`${field} must be a non-empty array`);
        }
        return value.map((item) => String(item));
    }
    validateParametersInternal(params) {
        const { randomVariables, decision, utilityNodes, evidence } = params;
        const variableNameSet = new Set(randomVariables.map((rv) => rv.name));
        if (variableNameSet.has(decision.name)) {
            throw new Error("decision variable name must be unique");
        }
        for (const rv of randomVariables) {
            rv.parents?.forEach((parent) => {
                if (!variableNameSet.has(parent) && parent !== decision.name) {
                    throw new Error(`Parent ${parent} of ${rv.name} is not defined`);
                }
            });
        }
        const evidenceKeys = Object.keys(evidence ?? {});
        for (const key of evidenceKeys) {
            if (!variableNameSet.has(key) && key !== decision.name) {
                throw new Error(`Evidence references unknown variable ${key}`);
            }
        }
        if (utilityNodes.length === 0) {
            throw new Error("At least one utility node is required");
        }
    }
    computeExpectedUtility(decisionValue, params) {
        const assignment = {
            ...(params.evidence ?? {}),
            [params.decision.name]: decisionValue,
        };
        let unnormalizedUtility = 0;
        let evidenceProbability = 0;
        let enumerationCount = 0;
        const chanceVariables = params.randomVariables;
        const recurse = (index, probability, partial) => {
            if (index === chanceVariables.length) {
                enumerationCount += 1;
                const utility = this.evaluateUtility(partial, params.utilityNodes);
                unnormalizedUtility += probability * utility;
                evidenceProbability += probability;
                return;
            }
            const variable = chanceVariables[index];
            if (partial[variable.name]) {
                const value = partial[variable.name];
                const distribution = this.getDistribution(variable, partial);
                const prob = distribution[value];
                if (prob === undefined) {
                    throw new Error(`Distribution missing probability for ${variable.name}=${value}`);
                }
                recurse(index + 1, probability * prob, partial);
                return;
            }
            for (const state of variable.states) {
                const distribution = this.getDistribution(variable, partial);
                const prob = distribution[state];
                if (prob === undefined)
                    continue;
                const nextAssignment = { ...partial, [variable.name]: state };
                recurse(index + 1, probability * prob, nextAssignment);
            }
        };
        recurse(0, 1, assignment);
        const expectedUtility = evidenceProbability > 0 ? unnormalizedUtility / evidenceProbability : 0;
        return {
            expectedUtility,
            rawUtility: unnormalizedUtility,
            evidenceProbability,
            enumerationCount,
        };
    }
    getDistribution(variable, assignment) {
        const parents = variable.parents ?? [];
        const entry = variable.cpt.find((row) => parents.every((parent) => row.when[parent] === assignment[parent]));
        if (!entry) {
            throw new Error(`No CPT row for ${variable.name} with parent assignment ${parents.map((p) => `${p}=${assignment[p] ?? "?"}`).join(",")}`);
        }
        return entry.distribution;
    }
    evaluateUtility(assignment, utilityNodes) {
        let total = 0;
        for (const node of utilityNodes) {
            for (const entry of node.table) {
                if (this.matches(entry.when, assignment)) {
                    total += entry.value;
                }
            }
        }
        return total;
    }
    matches(when, assignment) {
        return Object.entries(when).every(([key, value]) => assignment[key] === value);
    }
}
export default new DecisionNetworksOperation();
