import { z } from "zod";
import type { SessionState } from "../state/SessionState.js";
declare const SessionManagementSchema: z.ZodObject<
	{
		action: z.ZodEnum<["export", "import", "clear", "stats", "summary"]>;
		data: z.ZodOptional<z.ZodAny>;
		format: z.ZodOptional<z.ZodEnum<["json", "summary"]>>;
	},
	"strip",
	z.ZodTypeAny,
	{
		action: "stats" | "export" | "import" | "clear" | "summary";
		data?: any;
		format?: "json" | "summary" | undefined;
	},
	{
		action: "stats" | "export" | "import" | "clear" | "summary";
		data?: any;
		format?: "json" | "summary" | undefined;
	}
>;
export type SessionManagementArgs = z.infer<typeof SessionManagementSchema>;
declare function handleSessionManagement(
	args: SessionManagementArgs,
	session: SessionState,
): Promise<{
	content: {
		type: "text";
		text: string;
	}[];
}>;
export { handleSessionManagement };
//# sourceMappingURL=session-management.d.ts.map
