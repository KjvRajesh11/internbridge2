import {
  User,
  Internship,
  Application,
  StudentProject,
  StudentSkill,
  GeneratedDocument,
  AgentRun,
} from '../../models/index.js';
import { aiProvider } from './ai-provider.js';

export class CareerOpsAgentService {
  /**
   * Identifies applications that have remained in review beyond standard response targets (7+ days).
   */
  public async analyzeReviewDwellTimes(studentId: string): Promise<
    Array<{
      applicationId: string;
      internshipTitle: string;
      companyName: string;
      daysInReview: number;
      needsFollowUp: boolean;
      status: string;
    }>
  > {
    const applications = await Application.find({ student_id: studentId });
    const now = Date.now();
    const results = [];

    for (const app of applications) {
      if (['selected', 'rejected', 'withdrawn'].includes(app.status)) continue;

      const subTime = new Date(app.submission_timestamp).getTime();
      const days = Math.floor((now - subTime) / (1000 * 60 * 60 * 24));
      const internship = await Internship.findById(app.internship_id);
      const company = internship ? await import('../../models/index.js').then((m) => m.Company.findById(internship.company_id)) : null;

      results.push({
        applicationId: app.id,
        internshipTitle: internship?.title || 'Engineering Internship',
        companyName: company?.name || 'Recruiting Company',
        daysInReview: days,
        needsFollowUp: days >= 7,
        status: app.status,
      });
    }

    return results;
  }

  /**
   * Generates a polite, professional follow-up note for stalled applications.
   */
  public async generateFollowUpMessage(applicationId: string): Promise<{ message: string; source: string }> {
    const application = await Application.findById(applicationId);
    if (!application) throw new Error('Application not found.');

    const student = await User.findById(application.student_id);
    const internship = await Internship.findById(application.internship_id);
    const company = internship ? await import('../../models/index.js').then((m) => m.Company.findById(internship.company_id)) : null;

    if (!student || !internship) throw new Error('Required application records missing.');

    const subDate = new Date(application.submission_timestamp).toLocaleDateString();

    const prompt = `
Write a polite, professional 3-sentence recruitment follow-up email from a student applicant to an engineering recruiter.
Candidate: ${student.full_name}
Target Role: ${internship.title}
Company: ${company?.name || 'Company'}
Date Applied: ${subDate}
Rule: Keep it courteous, enthusiastic, and concise. Never sound entitled or pushy.
`.trim();

    const fallback = `Dear Hiring Team at ${company?.name || 'the company'},\n\nI hope you are having a productive week. I am following up on my application for the ${internship.title} position submitted on ${subDate}. I remain very enthusiastic about the opportunity to contribute to your team and would welcome the chance to provide any additional materials or discuss my qualifications.\n\nThank you for your time and consideration,\n${student.full_name}`;

    const res = await aiProvider.generateText(prompt, fallback);
    return { message: res.content, source: res.source };
  }

  /**
   * Generates tailored technical and behavioral mock interview questions.
   */
  public async generateInterviewPrepSheet(params: {
    studentId: string;
    internshipId: string;
  }): Promise<{
    technicalQuestions: Array<{ question: string; focusArea: string; modelAnswerTip: string }>;
    behavioralQuestions: Array<{ question: string; competency: string; starGuidance: string }>;
    companyBrief: string;
  }> {
    const student = await User.findById(params.studentId);
    const internship = await Internship.findById(params.internshipId);
    const projects = await StudentProject.find({ student_id: params.studentId });
    const skills = await StudentSkill.find({ student_id: params.studentId });

    const primaryProject = projects[0]?.title || 'Distributed Systems Project';
    const topSkills = skills.map((s) => s.skill_name).slice(0, 4).join(', ');

    return {
      technicalQuestions: [
        {
          question: `In your project "${primaryProject}", how did you design data consistency and handle latency tradeoffs?`,
          focusArea: 'Architecture & Tradeoffs',
          modelAnswerTip:
            'Discuss the specific protocols (e.g. Raft, caching, indexes) used and quantify the performance bottlenecks you resolved.',
        },
        {
          question: `The ${internship?.title || 'internship'} requires ${internship?.required_skills?.slice(0, 3).join(', ') || 'distributed engineering'}. How would you design a scalable failover pipeline?`,
          focusArea: 'System Design & High Availability',
          modelAnswerTip:
            'Outline load balancing, circuit breaking patterns, health check probes, and database replica failover.',
        },
        {
          question: `Walk us through a complex bug you encountered while working with ${topSkills || 'modern programming languages'} and how you root-caused it.`,
          focusArea: 'Debugging & RCA',
          modelAnswerTip:
            'Highlight how you used structured profiling, telemetry metrics, or memory heap analysis rather than guess-and-check.',
        },
      ],
      behavioralQuestions: [
        {
          question: 'Describe a situation where a project requirement was ambiguous or changed midway through development.',
          competency: 'Adaptability & Ownership',
          starGuidance:
            'Situation: the project ambiguity; Task: what you owned; Action: how you clarified specs; Result: on-time delivery.',
        },
        {
          question: 'Tell us about a time you had a technical disagreement with a team member or lab partner.',
          competency: 'Constructive Collaboration',
          starGuidance:
            'Focus on data-driven benchmarking and respectful communication rather than interpersonal conflict.',
        },
      ],
      companyBrief: `Role: ${internship?.title || 'Engineering Intern'}. Focus on demonstrating deep command of ${internship?.required_skills?.join(', ') || 'core concepts'} and hands-on project execution.`,
    };
  }

  /**
   * Evaluates candidate mock interview answers against a STAR framework rubric.
   */
  public async evaluateMockAnswer(params: {
    question: string;
    studentAnswer: string;
    studentId?: string;
  }): Promise<{
    overallScore: number;
    starAnalysis: {
      situationClarity: number;
      actionRigor: number;
      resultQuantified: number;
    };
    strengths: string[];
    improvements: string[];
    coachingFeedback: string;
  }> {
    const text = params.studentAnswer || '';
    const wordCount = text.trim().split(/\s+/).length;

    // Deterministic evaluation heuristics
    const mentionsMetric = /\d+%|\d+x|\d+ms|seconds|reduced|improved|scaled/i.test(text);
    const mentionsAction = /i implemented|i designed|i built|i debugged|my role|i tuned/i.test(text);
    const mentionsContext = /while|project|team|challenge|problem|faced|requirement/i.test(text);

    let situationScore = mentionsContext ? 85 : 65;
    let actionScore = mentionsAction ? 90 : 70;
    let resultScore = mentionsMetric ? 88 : 60;

    if (wordCount < 30) {
      situationScore -= 20;
      actionScore -= 20;
      resultScore -= 20;
    }

    const overall = Math.round((situationScore + actionScore + resultScore) / 3);

    const strengths: string[] = [];
    const improvements: string[] = [];

    if (mentionsAction) strengths.push('Clear first-person ownership of technical decisions and engineering choices.');
    else improvements.push('Clearly articulate YOUR individual actions ("I designed/built") rather than passive phrasing.');

    if (mentionsMetric) strengths.push('Concrete, quantifiable outcomes and performance metrics demonstrated.');
    else improvements.push('Quantify the final result (e.g. latency reduced by X%, throughput increased, user adoption).');

    if (wordCount >= 50) strengths.push('Comprehensive context provided without excessive verbosity.');
    else improvements.push('Expand on the specific technical challenges and architecture tradeoffs.');

    const prompt = `
Question: "${params.question}"
Candidate Mock Answer: "${params.studentAnswer}"

Provide 2 sentences of constructive, encouraging technical interview coaching advice for this engineering candidate.
`.trim();

    const fallbackCoaching = mentionsMetric
      ? 'Strong response with tangible results. To elevate it further, briefly articulate the alternative solutions you evaluated before choosing your approach.'
      : 'Good foundational technical narrative. Make sure to conclude your answer with measurable impact, such as latency reduction, test coverage, or benchmark throughput numbers.';

    const aiRes = await aiProvider.generateText(prompt, fallbackCoaching);

    return {
      overallScore: Math.max(40, Math.min(98, overall)),
      starAnalysis: {
        situationClarity: Math.max(40, Math.min(100, situationScore)),
        actionRigor: Math.max(40, Math.min(100, actionScore)),
        resultQuantified: Math.max(40, Math.min(100, resultScore)),
      },
      strengths,
      improvements,
      coachingFeedback: aiRes.content,
    };
  }

  public async generateInterviewPrepPack(studentId: string, internshipId: string) {
    return this.generateInterviewPrepSheet({ studentId, internshipId });
  }

  public async evaluateMockResponse(question: string, candidateResponse: string) {
    return this.evaluateMockAnswer({ question, studentAnswer: candidateResponse });
  }
}

export const careerOpsAgent = new CareerOpsAgentService();
export const CareerOpsAgent = careerOpsAgent;
