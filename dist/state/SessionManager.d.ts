import { SessionState } from "./SessionState.js";
import { type ServerConfig } from "../config.js";
interface SessionInfo {
	id: string;
	state: SessionState;
	createdAt: Date;
	lastAccessedAt: Date;
}
export declare class SessionManager {
	private sessions;
	private maxSessions;
	private sessionTimeout;
	private config;
	constructor(config?: ServerConfig);
	getOrCreateSession(sessionId: string): SessionInfo;
	getSession(sessionId: string): SessionInfo | undefined;
	private cleanupOldSessions;
	getAllSessions(): SessionInfo[];
	clearAllSessions(): void;
}
//# sourceMappingURL=SessionManager.d.ts.map
