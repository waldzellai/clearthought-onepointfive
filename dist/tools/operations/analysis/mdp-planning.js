import { BaseOperation } from "../base.js";
export class MdpPlanningOperation extends BaseOperation {
	name = "mdp_planning";
	category = "analysis";
	async execute(context) {
		const params = this.normalizeParameters(context.parameters);
		this.validateModel(params);
		const solver =
			params.algorithm === "policy_iteration"
				? this.policyIteration.bind(this)
				: this.valueIteration.bind(this);
		const result = solver(params);
		return this.createResult({
			prompt: this.getParam(context.parameters, "prompt", ""),
			...result,
		});
	}
	normalizeParameters(raw) {
		const discount = typeof raw.discount === "number" ? raw.discount : 0.95;
		const iterations = typeof raw.iterations === "number" ? raw.iterations : 100;
		const tolerance = typeof raw.tolerance === "number" ? raw.tolerance : 1e-4;
		const algorithm = raw.algorithm ?? "value_iteration";
		return {
			states: this.toStringArray(raw.states, "states"),
			actions: this.toStringArray(raw.actions, "actions"),
			transitions: this.parseTransitions(raw.transitions),
			rewards: this.parseRewards(raw.rewards),
			discount,
			iterations,
			tolerance,
			algorithm,
			initialValues: this.parseOptionalNumberRecord(raw.initialValues),
			initialPolicy: this.parseOptionalStringRecord(raw.initialPolicy),
		};
	}
	toStringArray(value, key) {
		if (!Array.isArray(value) || value.length === 0) {
			throw new Error(`mdp_planning requires a non-empty array for ${key}`);
		}
		return value.map((item) => String(item));
	}
	parseTransitions(value) {
		if (!Array.isArray(value) || value.length === 0) {
			throw new Error("mdp_planning requires transitions array");
		}
		return value.map((item) => {
			const entry = item;
			const probability = Number(entry.probability ?? entry.p ?? entry.prob ?? 0);
			if (Number.isNaN(probability) || probability < 0 || probability > 1) {
				throw new Error("Transition probability must be between 0 and 1");
			}
			return {
				from: String(entry.from),
				action: String(entry.action),
				to: String(entry.to),
				probability,
			};
		});
	}
	parseRewards(value) {
		if (!Array.isArray(value) || value.length === 0) {
			throw new Error("mdp_planning requires rewards array");
		}
		return value.map((item) => {
			const entry = item;
			return {
				state: String(entry.state ?? entry.s ?? entry.from),
				action: entry.action ? String(entry.action) : undefined,
				value: Number(entry.value ?? entry.reward ?? 0),
			};
		});
	}
	parseOptionalNumberRecord(value) {
		if (!value) return undefined;
		const record = value;
		const result = {};
		for (const [key, val] of Object.entries(record)) {
			result[key] = Number(val);
		}
		return result;
	}
	parseOptionalStringRecord(value) {
		if (!value) return undefined;
		return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, String(v)]));
	}
	validateModel(params) {
		const { states, actions, transitions } = params;
		const stateSet = new Set(states);
		const actionSet = new Set(actions);
		for (const t of transitions) {
			if (!stateSet.has(t.from)) {
				throw new Error(`Transition references unknown state '${t.from}'`);
			}
			if (!stateSet.has(t.to)) {
				throw new Error(`Transition references unknown state '${t.to}'`);
			}
			if (!actionSet.has(t.action)) {
				throw new Error(`Transition references unknown action '${t.action}'`);
			}
		}
	}
	buildRewardTable(rewards, states, actions) {
		const table = {};
		for (const s of states) {
			table[s] = {};
			for (const a of actions) {
				table[s][a] = 0;
			}
		}
		for (const reward of rewards) {
			const { state, action, value } = reward;
			if (!table[state]) continue;
			if (action) {
				table[state][action] = value;
			} else {
				for (const a of actions) {
					table[state][a] = value;
				}
			}
		}
		return table;
	}
	groupTransitions(transitions) {
		const grouped = {};
		for (const t of transitions) {
			if (!grouped[t.from]) grouped[t.from] = {};
			if (!grouped[t.from][t.action]) grouped[t.from][t.action] = [];
			grouped[t.from][t.action].push(t);
		}
		return grouped;
	}
	valueIteration(params) {
		const {
			states,
			actions,
			transitions,
			rewards,
			discount = 0.95,
			iterations = 100,
			tolerance = 1e-4,
		} = params;
		let values = Object.fromEntries(states.map((s) => [s, params.initialValues?.[s] ?? 0]));
		let policy = Object.fromEntries(
			states.map((s) => [s, params.initialPolicy?.[s] ?? actions[0]]),
		);
		const rewardTable = this.buildRewardTable(rewards, states, actions);
		const groupedTransitions = this.groupTransitions(transitions);
		const trace = [];
		for (let iter = 1; iter <= iterations; iter++) {
			let delta = 0;
			const newValues = { ...values };
			const newPolicy = { ...policy };
			for (const state of states) {
				let bestValue = -Infinity;
				let bestAction = actions[0];
				for (const action of actions) {
					const transitionsForAction = groupedTransitions[state]?.[action] ?? [];
					let expectedReturn = rewardTable[state]?.[action] ?? 0;
					for (const t of transitionsForAction) {
						expectedReturn += discount * t.probability * values[t.to];
					}
					if (expectedReturn > bestValue) {
						bestValue = expectedReturn;
						bestAction = action;
					}
				}
				newValues[state] = bestValue;
				newPolicy[state] = bestAction;
				delta = Math.max(delta, Math.abs(bestValue - values[state]));
			}
			values = newValues;
			policy = newPolicy;
			trace.push({ iteration: iter, values: { ...values }, policy: { ...policy }, delta });
			if (delta < tolerance) break;
		}
		return {
			algorithm: "value_iteration",
			policy,
			values,
			iterationsUsed: trace.length,
			converged: (() => {
				const last = trace[trace.length - 1];
				return last?.delta !== undefined ? last.delta < tolerance : false;
			})(),
			trace,
		};
	}
	policyIteration(params) {
		const {
			states,
			actions,
			transitions,
			rewards,
			discount = 0.95,
			iterations = 50,
			tolerance = 1e-6,
		} = params;
		let policy = Object.fromEntries(
			states.map((s) => [s, params.initialPolicy?.[s] ?? actions[0]]),
		);
		let values = Object.fromEntries(states.map((s) => [s, params.initialValues?.[s] ?? 0]));
		const rewardTable = this.buildRewardTable(rewards, states, actions);
		const groupedTransitions = this.groupTransitions(transitions);
		const trace = [];
		for (let iter = 1; iter <= iterations; iter++) {
			// Policy evaluation (iterative)
			values = this.policyEvaluation(
				policy,
				values,
				groupedTransitions,
				rewardTable,
				states,
				discount,
				tolerance,
			);
			let policyStable = true;
			const newPolicy = { ...policy };
			for (const state of states) {
				const oldAction = policy[state];
				let bestAction = oldAction;
				let bestValue = this.evaluateAction(
					state,
					oldAction,
					groupedTransitions,
					rewardTable,
					values,
					discount,
				);
				for (const action of actions) {
					const actionValue = this.evaluateAction(
						state,
						action,
						groupedTransitions,
						rewardTable,
						values,
						discount,
					);
					if (actionValue > bestValue + 1e-12) {
						// tie-breaker stability
						bestValue = actionValue;
						bestAction = action;
					}
				}
				newPolicy[state] = bestAction;
				if (bestAction !== oldAction) {
					policyStable = false;
				}
			}
			policy = newPolicy;
			trace.push({ iteration: iter, values: { ...values }, policy: { ...policy } });
			if (policyStable) {
				return {
					algorithm: "policy_iteration",
					policy,
					values,
					iterationsUsed: iter,
					converged: true,
					trace,
				};
			}
		}
		return {
			algorithm: "policy_iteration",
			policy,
			values,
			iterationsUsed: iterations,
			converged: false,
			trace,
		};
	}
	policyEvaluation(policy, initialValues, transitions, rewards, states, discount, tolerance) {
		let values = { ...initialValues };
		while (true) {
			let delta = 0;
			const newValues = { ...values };
			for (const state of states) {
				const action = policy[state];
				const reward = rewards[state]?.[action] ?? 0;
				let expected = reward;
				for (const t of transitions[state]?.[action] ?? []) {
					expected += discount * t.probability * values[t.to];
				}
				newValues[state] = expected;
				delta = Math.max(delta, Math.abs(expected - values[state]));
			}
			values = newValues;
			if (delta < tolerance) break;
		}
		return values;
	}
	evaluateAction(state, action, transitions, rewards, values, discount) {
		let expected = rewards[state]?.[action] ?? 0;
		for (const t of transitions[state]?.[action] ?? []) {
			expected += discount * t.probability * values[t.to];
		}
		return expected;
	}
}
export default new MdpPlanningOperation();
