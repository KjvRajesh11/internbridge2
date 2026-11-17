import {
  User,
  Internship,
  Application,
  ApplicationStatusHistory,
  StudentPreferences,
  StudentDocument,
  Notification,
  AgentRun,
} from '../../models/index.js';
import { guardAgent } from './guard-agent.js';
import { hunterAgent } from './hunter-agent.js';
import { personalizationAgent } from './personalization-agent.js';

export interface SubmitApplicationResult {
  success: boolean;
  applicationId?: string;
  application?: any;
  message: string;
  reasons?: string[];
}

export class ExecutionAgentService {
  /**
   * Executes application submission with complete eligibility and duplicate checks.
   */
  public async submitApplication(params: {
    studentId: string;
    internshipId: string;
    mode?: 'assisted' | 'autonomous_auto_apply';
    coverLetter?: string;
    answers?: Record<string, string>;
  }): Promise<SubmitApplicationResult> {
    const isAuto = params.mode === 'autonomous_auto_apply';

    // 1. Hard Gatekeeper: Agent 4 Eligibility & Integrity Check
    const guardResult = await guardAgent.evaluateEligibility({
      studentId: params.studentId,
      internshipId: params.internshipId,
      isAutoApply: isAuto,
    });

    if (!guardResult.passed) {
      return {
        success: false,
        message: 'Application rejected by InternBridge Eligibility & Integrity Guard.',
        reasons: guardResult.failureReasons,
      };
    }

    const student = await User.findById(params.studentId);
    const internship = await Internship.findById(params.internshipId);
    const studentDocs = await StudentDocument.find({ student_id: params.studentId });
    const primaryResume = studentDocs.find((d) => d.is_primary) || studentDocs[0];

    // Compute compatibility score
    const studentSkillsDocs = await import('../../models/index.js').then((m) =>
      m.StudentSkill.find({ student_id: params.studentId })
    );
    const studentProjectsDocs = await import('../../models/index.js').then((m) =>
      m.StudentProject.find({ student_id: params.studentId })
    );
    const preferences = await StudentPreferences.findOne({ student_id: params.studentId });

    const studentSkills = studentSkillsDocs.map((s) => s.skill_name.toLowerCase());
    const projectTechs = studentProjectsDocs.flatMap((p) => p.technologies).map((t) => t.toLowerCase());
    const allKnownSkills = Array.from(new Set([...studentSkills, ...projectTechs]));

    const match = hunterAgent.calculateMatch(student!, internship!, allKnownSkills, preferences);

    // 2. Persist Application into MongoDB
    try {
      const appId = 'app-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

      const application = await Application.create({
        _id: appId,
        student_id: params.studentId,
        internship_id: params.internshipId,
        status: 'applied',
        resume_url: primaryResume?.file_url || '',
        answers: params.answers || {},
        cover_letter: params.coverLetter || '',
        match_score: match.compatibility_score,
        match_analysis: match,
        submission_timestamp: new Date(),
      });

      // 3. Status History Initial Audit Event
      await ApplicationStatusHistory.create({
        _id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        application_id: appId,
        previous_status: undefined,
        new_status: 'applied',
        changed_by: params.studentId,
        change_timestamp: new Date(),
        reason: isAuto
          ? 'Automated submission executed by Agent 3 (Authorized Auto-Apply).'
          : 'Candidate submitted formal application via InternBridge portal.',
      });

      // 4. Create in-app notification for the recruiter
      await Notification.create({
        _id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        recipient_id: internship!.created_by,
        type: 'new_application',
        title: 'New Candidate Application Received',
        message: `${student!.full_name} submitted an application for ${internship!.title} (${match.compatibility_score}% compatibility).`,
        link: `/recruiter/applicants/${appId}`,
        read: false,
      });

      // 5. Audit Log in AgentRun
      await AgentRun.create({
        _id: 'run-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        user_id: params.studentId,
        agent_type: 'execution_agent',
        status: 'completed',
        trigger_type: isAuto ? 'auto' : 'manual',
        input_summary: {
          internship_id: params.internshipId,
          mode: params.mode || 'assisted',
          match_score: match.compatibility_score,
        },
        output_summary: {
          application_id: appId,
          status: 'applied',
        },
        started_at: new Date(Date.now() - 300),
        completed_at: new Date(),
      });

      return {
        success: true,
        applicationId: appId,
        application: application.toJSON(),
        message: 'Application successfully validated and submitted.',
      };
    } catch (err: any) {
      if (err.code === 11000 || err.message?.includes('duplicate key')) {
        const customErr: any = new Error('A student cannot apply to the same internship more than once.');
        customErr.code = 'DUPLICATE_APPLICATION';
        throw customErr;
      }
      throw err;
    }
  }

  /**
   * Scans eligible listings and executes pre-authorized auto-applications within candidate limits.
   */
  public async runAutonomousAutoApply(studentId: string): Promise<{
    evaluated: number;
    submitted: number;
    applications: any[];
    failures: Array<{ internshipId: string; title: string; reasons: string[] }>;
  }> {
    const preferences = await StudentPreferences.findOne({ student_id: studentId });
    if (!preferences || !preferences.auto_apply_enabled) {
      return {
        evaluated: 0,
        submitted: 0,
        applications: [],
        failures: [
          {
            internshipId: '',
            title: 'Auto-Apply Configuration',
            reasons: ['Auto-apply is currently disabled in candidate settings.'],
          },
        ],
      };
    }

    const threshold = preferences.auto_apply_settings?.match_threshold || 80;
    const weeklyMax = preferences.auto_apply_settings?.max_weekly_apps || 5;

    // Check weekly submission count
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
    const recentAppsCount = await Application.countDocuments({
      student_id: studentId,
      submission_timestamp: { $gte: oneWeekAgo },
    });

    const remainingQuota = Math.max(0, weeklyMax - recentAppsCount);
    if (remainingQuota === 0) {
      return {
        evaluated: 0,
        submitted: 0,
        applications: [],
        failures: [
          {
            internshipId: '',
            title: 'Weekly Application Cap',
            reasons: [`You have reached your configured weekly limit of ${weeklyMax} applications.`],
          },
        ],
      };
    }

    const recommendations = await hunterAgent.findRecommendations(studentId);
    let submittedCount = 0;
    const submittedApps: any[] = [];
    const failures: Array<{ internshipId: string; title: string; reasons: string[] }> = [];

    for (const rec of recommendations) {
      if (submittedCount >= remainingQuota) break;
      if (rec.hasApplied) continue;

      if (rec.matchAnalysis.compatibility_score >= threshold) {
        // Generate tailored cover letter
        const tailored = await personalizationAgent.generateTailoredCoverLetter({
          studentId,
          internshipId: rec.internship.id,
        });

        const result = await this.submitApplication({
          studentId,
          internshipId: rec.internship.id,
          mode: 'autonomous_auto_apply',
          coverLetter: tailored.content,
        });

        if (result.success) {
          submittedCount++;
          submittedApps.push(result.application);
        } else {
          failures.push({
            internshipId: rec.internship.id,
            title: rec.internship.title,
            reasons: result.reasons || [result.message],
          });
        }
      }
    }

    return {
      evaluated: recommendations.length,
      submitted: submittedCount,
      applications: submittedApps,
      failures,
    };
  }

  public async runAutoApplyBatch(studentId: string) {
    return this.runAutonomousAutoApply(studentId);
  }
}

export const executionAgent = new ExecutionAgentService();
export const ExecutionAgent = executionAgent;
