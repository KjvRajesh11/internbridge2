export declare class AgentOrchestrator {
    hunter: import("./hunter-agent.js").HunterAgentService;
    personalization: import("./personalization-agent.js").PersonalizationAgentService;
    execution: import("./execution-agent.js").ExecutionAgentService;
    guard: import("./guard-agent.js").GuardAgentService;
    careerOps: import("./career-ops-agent.js").CareerOpsAgentService;
    getSystemStatus(): {
        activeAgents: {
            id: string;
            name: string;
            status: string;
            description: string;
        }[];
        aiProvider: {
            configured: boolean;
            provider: string;
        };
    };
    getRecentAgentRuns(userId: string): Promise<(import("mongoose").Document<unknown, {}, import("../../models/AgentRun.js").IAgentRun, {}, {}> & import("../../models/AgentRun.js").IAgentRun & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
}
export declare const agentOrchestrator: AgentOrchestrator;
