import { hunterAgent } from './hunter-agent.js';
import { personalizationAgent } from './personalization-agent.js';
import { executionAgent } from './execution-agent.js';
import { guardAgent } from './guard-agent.js';
import { careerOpsAgent } from './career-ops-agent.js';
import { aiProvider } from './ai-provider.js';
import { AgentRun } from '../../models/index.js';
export class AgentOrchestrator {
    hunter = hunterAgent;
    personalization = personalizationAgent;
    execution = executionAgent;
    guard = guardAgent;
    careerOps = careerOpsAgent;
    getSystemStatus() {
        const aiStatus = aiProvider.getProviderStatus();
        return {
            activeAgents: [
                {
                    id: 'hunter_agent',
                    name: 'Agent 1: Autonomous Internship Hunter',
                    status: 'online',
                    description: 'Weighted opportunity matching, skill gap discovery, and preference alignment.',
                },
                {
                    id: 'personalization_agent',
                    name: 'Agent 2: AI Resume & Cover Letter Personalization',
                    status: 'online',
                    description: 'Truthful tailored cover letters, bullet improvements, and screening answers.',
                },
                {
                    id: 'execution_agent',
                    name: 'Agent 3: Autonomous Application Execution',
                    status: 'online',
                    description: 'Reliable assisted and pre-authorized internal application submission.',
                },
                {
                    id: 'guard_agent',
                    name: 'Agent 4: Eligibility & Integrity Guard',
                    status: 'online',
                    description: 'Deterministic enforcement of deadlines, GPA, and duplicate prevention.',
                },
                {
                    id: 'career_ops_agent',
                    name: 'Agent 5: Career Operations & Interview Preparation',
                    status: 'online',
                    description: 'Stage dwell analysis, follow-up generation, and technical interview rehearsal.',
                },
            ],
            aiProvider: aiStatus,
        };
    }
    async getRecentAgentRuns(userId) {
        return AgentRun.find({ user_id: userId }).sort({ started_at: -1 }).limit(10);
    }
}
export const agentOrchestrator = new AgentOrchestrator();
