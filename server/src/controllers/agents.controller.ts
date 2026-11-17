import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AgentRun } from '../models/index.js';
import { HunterAgent } from '../services/agents/hunter-agent.js';
import { PersonalizationAgent } from '../services/agents/personalization-agent.js';
import { ExecutionAgent } from '../services/agents/execution-agent.js';
import { GuardAgent } from '../services/agents/guard-agent.js';
import { CareerOpsAgent } from '../services/agents/career-ops-agent.js';
import { aiProvider } from '../services/agents/ai-provider.js';

export async function getAgentsStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const runs = await AgentRun.find().sort({ created_at: -1 }).limit(10);
    const providerInfo = aiProvider.getProviderInfo();

    return res.json({
      success: true,
      agents: [
        {
          id: 'agent-1-hunter',
          name: 'Autonomous Internship Hunter',
          version: '3.2.0',
          status: 'online',
          description: 'Calculates 5-factor weighted opportunity alignment and discovers tailored internships.',
          capabilities: ['skills-matching', 'role-alignment', 'ranking', 'missing-skill-gap-analysis'],
        },
        {
          id: 'agent-2-personalization',
          name: 'Document & Application Personalizer',
          version: '2.8.4',
          status: 'online',
          description: 'Drafts candidate-specific, project-grounded cover letters and screening question answers.',
          capabilities: ['cover-letters', 'screening-answers', 'bullet-refinement'],
        },
        {
          id: 'agent-3-execution',
          name: 'Autonomous Application Executor',
          version: '3.0.1',
          status: 'online',
          description: 'Assisted submission and authorized auto-apply under weekly quota caps.',
          capabilities: ['quota-enforcement', 'candidate-permission-gating', 'auto-apply'],
        },
        {
          id: 'agent-4-guard',
          name: 'Eligibility & Integrity Guard',
          version: '4.1.0',
          status: 'online',
          description: 'Deterministic gatekeeper enforcing GPA, graduation year, deadline, and single-application rules.',
          capabilities: ['single-application-enforcement', 'gpa-verification', 'deadline-checks'],
        },
        {
          id: 'agent-5-career-ops',
          name: 'Career Operations & Interview Coach',
          version: '2.5.0',
          status: 'online',
          description: 'Dwell time monitoring, polite follow-ups, and interactive STAR mock interview evaluation.',
          capabilities: ['mock-interview-evaluation', 'star-framework', 'follow-up-generation'],
        },
      ],
      aiProvider: providerInfo,
      recentRuns: runs.map((r) => r.toJSON()),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAgentRuns(req: AuthenticatedRequest, res: Response) {
  try {
    const { agent_type, status, limit } = req.query;
    const filter: any = {};
    if (agent_type) filter.agent_type = agent_type;
    if (status) filter.status = status;

    let query = AgentRun.find(filter).sort({ created_at: -1 });
    if (limit) query = query.limit(parseInt(limit as string, 10));

    const runs = await query.exec();
    return res.json({ success: true, runs: runs.map((r) => r.toJSON()) });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function triggerHunter(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { limit } = req.body;
    const matches = await HunterAgent.findMatchesForStudent(userId, limit ? Number(limit) : 10);

    return res.json({
      success: true,
      matches,
      count: matches.length,
      message: `Hunter discovered ${matches.length} matching opportunities.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function generatePersonalization(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { internship_id, type, question } = req.body;
    if (!internship_id) {
      return res.status(400).json({ success: false, error: 'Internship ID is required.' });
    }

    if (type === 'screening_answer') {
      const answer = await PersonalizationAgent.generateScreeningResponse(
        userId,
        internship_id,
        question || 'Why are you a strong fit for this internship?'
      );
      return res.json({ success: true, content: answer });
    }

    const letter = await PersonalizationAgent.generateCoverLetter(userId, internship_id);
    return res.json({ success: true, content: letter });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function runAutoApply(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await ExecutionAgent.runAutoApplyBatch(userId);
    return res.json({ success: true, result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function validateGuard(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { internship_id } = req.body;

    if (!userId || !internship_id) {
      return res.status(400).json({ success: false, error: 'Student ID and Internship ID are required.' });
    }

    const result = await GuardAgent.verifyEligibility(userId, internship_id);
    return res.json({ success: true, result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function evaluateMockResponse(req: AuthenticatedRequest, res: Response) {
  try {
    const { question, candidate_response } = req.body;
    if (!question || !candidate_response) {
      return res.status(400).json({ success: false, error: 'Question and response are required.' });
    }

    const evaluation = await CareerOpsAgent.evaluateMockResponse(question, candidate_response);
    return res.json({ success: true, evaluation });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function generateFollowUp(req: AuthenticatedRequest, res: Response) {
  try {
    const { application_id } = req.body;
    if (!application_id) {
      return res.status(400).json({ success: false, error: 'Application ID is required.' });
    }

    const message = await CareerOpsAgent.generateFollowUpMessage(application_id);
    return res.json({ success: true, message });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
