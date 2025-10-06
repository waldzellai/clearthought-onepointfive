/**
 * Session Export Operation
 *
 * Exports session data for persistence or analysis
 */
import { BaseOperation } from "../base.js";
export class SessionExportOperation extends BaseOperation {
    name = "session_export";
    category = "session";
    async execute(context) {
        const { sessionState } = context;
        return this.createResult({
            sessionData: sessionState.export(),
        });
    }
}
export default new SessionExportOperation();
