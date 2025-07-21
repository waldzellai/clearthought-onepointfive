import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
export interface MentalModelArgs {
    modelName: "first_principles" | "opportunity_cost" | "error_propagation" | "rubber_duck" | "pareto_principle" | "occams_razor";
    steps: string[];
    conclusion: string;
}
export declare function handleMentalModel(args: MentalModelArgs): Promise<CallToolResult>;
//# sourceMappingURL=mental-model.d.ts.map