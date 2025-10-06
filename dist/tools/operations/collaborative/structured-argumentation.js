/**
 * Structured Argumentation Operation
 *
 * Builds and analyzes structured arguments using formal reasoning principles
 */
import { BaseOperation } from "../base.js";
export class StructuredArgumentationOperation extends BaseOperation {
    name = "structured_argumentation";
    category = "collaborative";
    async execute(context) {
        const { sessionState, prompt, parameters } = context;
        // Extract argumentation parameters
        const argumentType = this.getParam(parameters, "argumentType", "deductive");
        const premises = parameters.premises || [];
        const conclusion = this.getParam(parameters, "conclusion", "");
        const counterarguments = parameters.counterarguments || [];
        const rebuttals = parameters.rebuttals || [];
        const evidenceStrength = this.getParam(parameters, "evidenceStrength", "moderate");
        // Generate premises if not provided
        const generatedPremises = premises.length === 0 ? this.generatePremises(prompt, argumentType) : premises;
        // Generate conclusion if not provided
        const generatedConclusion = conclusion || this.generateConclusion(generatedPremises, argumentType);
        // Validate argument structure
        const validity = this.validateArgument(generatedPremises, generatedConclusion, argumentType);
        // Generate counterarguments if not provided
        const generatedCounterarguments = counterarguments.length === 0
            ? this.generateCounterarguments(generatedPremises, generatedConclusion)
            : counterarguments;
        // Generate rebuttals if not provided
        const generatedRebuttals = rebuttals.length === 0 ? this.generateRebuttals(generatedCounterarguments) : rebuttals;
        // Assess overall argument strength
        const argumentStrength = this.assessArgumentStrength(validity, generatedCounterarguments, generatedRebuttals, evidenceStrength);
        const argumentationData = {
            topic: prompt,
            argumentType,
            premises: generatedPremises,
            conclusion: generatedConclusion,
            validity,
            counterarguments: generatedCounterarguments,
            rebuttals: generatedRebuttals,
            argumentStrength,
            evidenceStrength,
            logicalForm: this.extractLogicalForm(generatedPremises, generatedConclusion, argumentType),
            sessionId: `argument-${Date.now()}`,
            timestamp: new Date().toISOString(),
        };
        // Update session metrics
        sessionState.updateKPI("argument_premises", generatedPremises.length);
        sessionState.updateKPI("counterarguments_addressed", generatedCounterarguments.length);
        return this.createResult({
            ...argumentationData,
            sessionContext: {
                sessionId: sessionState.sessionId,
                stats: sessionState.getStats(),
            },
        });
    }
    generatePremises(topic, argumentType) {
        const templates = {
            deductive: [
                `All instances of ${topic} share certain characteristics`,
                `The current case exhibits these characteristics`,
                `Therefore, logical conclusions follow`,
            ],
            inductive: [
                `Multiple observed cases of ${topic} show a pattern`,
                `This pattern appears consistent across contexts`,
                `Similar cases likely follow the same pattern`,
            ],
            abductive: [
                `We observe certain phenomena related to ${topic}`,
                `A specific explanation would account for these phenomena`,
                `No alternative explanation is as plausible`,
            ],
            analogical: [
                `${topic} is similar to a known case in relevant ways`,
                `The known case has certain properties`,
                `The similarities are significant enough to transfer properties`,
            ],
        };
        return templates[argumentType] || templates.deductive;
    }
    generateConclusion(premises, argumentType) {
        const conclusionTemplates = {
            deductive: "Therefore, the conclusion follows necessarily from the premises",
            inductive: "Therefore, this pattern likely holds in general",
            abductive: "Therefore, this explanation is most likely correct",
            analogical: "Therefore, the same properties apply to this case",
        };
        return (conclusionTemplates[argumentType] ||
            "Therefore, the conclusion follows from the premises");
    }
    validateArgument(premises, conclusion, argumentType) {
        const validity = {
            isValid: true,
            strength: "strong",
            issues: [],
            type: argumentType,
        };
        // Basic validation checks
        if (premises.length < 2) {
            validity.isValid = false;
            validity.strength = "weak";
            validity.issues.push("Insufficient premises for strong argument");
        }
        if (!conclusion || conclusion.length < 10) {
            validity.isValid = false;
            validity.strength = "weak";
            validity.issues.push("Conclusion is too vague or missing");
        }
        // Type-specific validation
        switch (argumentType) {
            case "deductive":
                if (!this.hasLogicalConnection(premises, conclusion)) {
                    validity.issues.push("Premises do not logically entail conclusion");
                    validity.strength = "moderate";
                }
                break;
            case "inductive":
                if (premises.length < 3) {
                    validity.issues.push("Inductive arguments need more evidence");
                    validity.strength = "moderate";
                }
                break;
            case "abductive":
                validity.issues.push("Abductive reasoning requires comparison of explanations");
                validity.strength = "moderate";
                break;
            case "analogical":
                validity.issues.push("Analogical arguments depend on similarity strength");
                validity.strength = "moderate";
                break;
        }
        return validity;
    }
    hasLogicalConnection(premises, conclusion) {
        // Simple heuristic: check for common logical connectors
        const logicalWords = ["therefore", "thus", "hence", "follows", "implies"];
        return logicalWords.some((word) => conclusion.toLowerCase().includes(word) ||
            premises.some((premise) => premise.toLowerCase().includes(word)));
    }
    generateCounterarguments(premises, conclusion) {
        return [
            {
                type: "premise_challenge",
                argument: "One or more premises may be false or unsupported",
                target: "premises",
                strength: "moderate",
                description: "Challenges the truth of the underlying premises",
            },
            {
                type: "alternative_explanation",
                argument: "Alternative explanations may better account for the evidence",
                target: "conclusion",
                strength: "moderate",
                description: "Proposes competing explanations for the same evidence",
            },
            {
                type: "scope_limitation",
                argument: "The argument may not apply broadly or may have exceptions",
                target: "generalization",
                strength: "weak",
                description: "Questions the scope or universality of the conclusion",
            },
        ];
    }
    generateRebuttals(counterarguments) {
        return counterarguments.map((counter, index) => ({
            targets: counter.type,
            rebuttal: this.generateSpecificRebuttal(counter.type),
            strength: this.calculateRebuttalStrength(counter.strength),
            evidence: `Supporting evidence for rebuttal ${index + 1}`,
            effectiveness: Math.random() * 0.4 + 0.6, // 0.6-1.0
        }));
    }
    generateSpecificRebuttal(counterType) {
        const rebuttals = {
            premise_challenge: "The premises are well-supported by multiple independent sources",
            alternative_explanation: "Alternative explanations lack the explanatory power of the original",
            scope_limitation: "The argument applies within clearly defined scope parameters",
        };
        return (rebuttals[counterType] ||
            "This counterargument does not significantly weaken the original argument");
    }
    calculateRebuttalStrength(counterStrength) {
        const strengthMap = {
            weak: "strong",
            moderate: "moderate",
            strong: "weak",
        };
        return strengthMap[counterStrength] || "moderate";
    }
    assessArgumentStrength(validity, counterarguments, rebuttals, evidenceStrength) {
        let baseScore = validity.isValid ? 0.7 : 0.3;
        // Adjust for validity strength
        const strengthMultiplier = {
            weak: 0.8,
            moderate: 1.0,
            strong: 1.2,
        };
        baseScore *= strengthMultiplier[validity.strength] || 1.0;
        // Adjust for counterarguments and rebuttals
        const counterargumentPenalty = counterarguments.length * 0.1;
        const rebuttalBonus = rebuttals.length * 0.05;
        const finalScore = Math.max(0.1, Math.min(1.0, baseScore - counterargumentPenalty + rebuttalBonus));
        return {
            overall: finalScore,
            category: finalScore > 0.8 ? "strong" : finalScore > 0.6 ? "moderate" : "weak",
            factors: {
                validity: validity.strength,
                evidence: evidenceStrength,
                counterarguments: counterarguments.length,
                rebuttals: rebuttals.length,
            },
            confidence: Math.round(finalScore * 100),
        };
    }
    extractLogicalForm(premises, conclusion, argumentType) {
        // Simplified logical form extraction
        const form = {
            type: argumentType,
            structure: this.getArgumentStructure(argumentType),
            premises: premises.map((premise, index) => ({
                id: `P${index + 1}`,
                statement: premise,
                role: this.identifyPremiseRole(premise, index),
            })),
            conclusion: {
                id: "C",
                statement: conclusion,
                follows_from: premises.map((_, index) => `P${index + 1}`),
            },
            validity: this.assessLogicalValidity(argumentType),
        };
        return form;
    }
    getArgumentStructure(argumentType) {
        const structures = {
            deductive: "If P1 and P2, then C",
            inductive: "P1, P2, P3... suggest C",
            abductive: "C best explains P1, P2, P3...",
            analogical: "P1 is like P2, P2 has property X, therefore P1 has property X",
        };
        return structures[argumentType] || "P1, P2... therefore C";
    }
    identifyPremiseRole(premise, index) {
        if (index === 0)
            return "major";
        if (premise.toLowerCase().includes("current") || premise.toLowerCase().includes("this")) {
            return "minor";
        }
        return "supporting";
    }
    assessLogicalValidity(argumentType) {
        // Simplified validity assessment
        const validityTypes = {
            deductive: "necessarily_valid",
            inductive: "probably_valid",
            abductive: "plausibly_valid",
            analogical: "conditionally_valid",
        };
        return validityTypes[argumentType] || "conditionally_valid";
    }
}
export default new StructuredArgumentationOperation();
