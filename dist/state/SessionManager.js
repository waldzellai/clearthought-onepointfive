import { SessionState } from './SessionState.js';
import { defaultConfig } from '../config.js';
export class SessionManager {
    sessions = new Map();
    maxSessions = 100;
    sessionTimeout = 3600000; // 1 hour
    config;
    constructor(config) {
        this.config = config || defaultConfig;
    }
    getOrCreateSession(sessionId) {
        if (this.sessions.has(sessionId)) {
            const session = this.sessions.get(sessionId);
            session.lastAccessedAt = new Date();
            return session;
        }
        // Clean up old sessions if at limit
        if (this.sessions.size >= this.maxSessions) {
            this.cleanupOldSessions();
        }
        const sessionInfo = {
            id: sessionId,
            state: new SessionState(sessionId, this.config),
            createdAt: new Date(),
            lastAccessedAt: new Date()
        };
        this.sessions.set(sessionId, sessionInfo);
        return sessionInfo;
    }
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastAccessedAt = new Date();
        }
        return session;
    }
    cleanupOldSessions() {
        const now = Date.now();
        const toDelete = [];
        for (const [id, session] of this.sessions) {
            if (now - session.lastAccessedAt.getTime() > this.sessionTimeout) {
                toDelete.push(id);
            }
        }
        for (const id of toDelete) {
            this.sessions.delete(id);
        }
        // If still over limit, remove oldest
        if (this.sessions.size >= this.maxSessions) {
            const sorted = Array.from(this.sessions.entries())
                .sort((a, b) => a[1].lastAccessedAt.getTime() - b[1].lastAccessedAt.getTime());
            const toRemove = sorted.slice(0, Math.floor(this.maxSessions / 4));
            for (const [id] of toRemove) {
                this.sessions.delete(id);
            }
        }
    }
    getAllSessions() {
        return Array.from(this.sessions.values());
    }
    clearAllSessions() {
        this.sessions.clear();
    }
}
//# sourceMappingURL=SessionManager.js.map