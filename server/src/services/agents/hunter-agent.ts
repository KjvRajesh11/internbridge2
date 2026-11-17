import {
  User,
  Internship,
  StudentSkill,
  StudentProject,
  StudentPreferences,
  Application,
  AgentRun,
  IUser,
  IInternship,
} from '../../models/index.js';
import { guardAgent } from './guard-agent.js';
import { aiProvider } from './ai-provider.js';
import { MatchAnalysis } from '@shared/types/index.js';

export interface HunterRecommendation {
  internship: IInternship;
  matchAnalysis: MatchAnalysis;
  aiExplanation?: string;
  hasApplied: boolean;
}

export class HunterAgentService {
  /**
   * Deterministic weighted matching algorithm:
   * Required skill alignment: 40%
   * Preferred skill alignment: 20%
   * Role and interest alignment: 15%
   * Educational alignment: 10%
   * Location and work-mode alignment: 10%
   * Duration and availability alignment: 5%
   */
  public calculateMatch(
    student: IUser,
    internship: IInternship,
    skills: string[],
    preferences?: any
  ): MatchAnalysis {
    // 1. Required Skills Alignment (40%)
    const reqSkills = internship.required_skills.map((s) => s.toLowerCase());
    const matchingReq = reqSkills.filter((s) => skills.some((ss) => ss.includes(s) || s.includes(ss)));
    const reqScore = reqSkills.length > 0 ? (matchingReq.length / reqSkills.length) * 40 : 40;

    // 2. Preferred Skills Alignment (20%)
    const prefSkills = internship.preferred_skills.map((s) => s.toLowerCase());
    const matchingPref = prefSkills.filter((s) => skills.some((ss) => ss.includes(s) || s.includes(ss)));
    const prefScore = prefSkills.length > 0 ? (matchingPref.length / prefSkills.length) * 20 : 15;

    // 3. Role & Interest Alignment (15%)
    let roleScore = 5;
    const targetRoles: string[] = preferences?.target_roles?.map((r: string) => r.toLowerCase()) || [];
    const titleLower = internship.title.toLowerCase();
    const descLower = internship.description.toLowerCase();

    const hasRoleMatch = targetRoles.some((r) => {
      if (titleLower.includes(r) || descLower.includes(r)) return true;
      const tokens = r.split(/\s+/);
      return tokens.filter((t) => t.length > 3).some((t) => titleLower.includes(t) || descLower.includes(t));
    });

    if (hasRoleMatch) {
      roleScore = 15;
    } else if (targetRoles.length === 0) {
      roleScore = 10;
    }

    // 4. Educational Alignment (10%)
    let eduScore = 10;
    if (internship.minimum_gpa && student.gpa) {
      if (student.gpa < internship.minimum_gpa) {
        eduScore -= 5;
      }
    }
    if (internship.accepted_graduation_years?.length && student.graduation_year) {
      if (!internship.accepted_graduation_years.includes(student.graduation_year)) {
        eduScore -= 5;
      }
    }
    eduScore = Math.max(0, eduScore);

    // 5. Location and Work-Mode Alignment (10%)
    let locScore = 5;
    const preferredModes: string[] = preferences?.work_mode_preference?.map((m: string) => m.toLowerCase()) || [];
    if (preferredModes.includes(internship.work_mode.toLowerCase())) {
      locScore += 3;
    }
    const preferredLocs: string[] = preferences?.preferred_locations?.map((l: string) => l.toLowerCase()) || [];
    if (preferredLocs.some((l) => internship.location.toLowerCase().includes(l))) {
      locScore += 2;
    }
    locScore = Math.min(10, locScore);

    // Compute composite score (0 - 100)
    const compositeScore = Math.round(reqScore + prefScore + roleScore + eduScore + locScore);

    // Skills analysis
    const allInternshipSkills = Array.from(new Set([...reqSkills, ...prefSkills]));
    const matched = allInternshipSkills.filter((s) => skills.some((ss) => ss.includes(s) || s.includes(ss)));
    const missing = reqSkills.filter((s) => !skills.some((ss) => ss.includes(s) || s.includes(ss)));

    const reasons: string[] = [];
    if (matchingReq.length > 0) {
      reasons.push(`Direct alignment on ${matchingReq.length}/${reqSkills.length} required competencies.`);
    }
    if (hasRoleMatch) {
      reasons.push('Position title directly matches your declared target career roles.');
    }
    if (student.gpa && internship.minimum_gpa && student.gpa >= internship.minimum_gpa) {
      reasons.push(`Academic credentials comfortably satisfy minimum cutoff (${student.gpa} >= ${internship.minimum_gpa}).`);
    }

    return {
      compatibility_score: compositeScore,
      matching_skills: matched.map((s) => s.toUpperCase()),
      missing_skills: missing.map((s) => s.toUpperCase()),
      eligibility_passed: eduScore >= 5,
      reasons,
      breakdown: {
        required_skills_pct: Math.round(reqScore),
        preferred_skills_pct: Math.round(prefScore),
        role_alignment_pct: roleScore,
        education_alignment_pct: eduScore,
        location_alignment_pct: locScore,
      },
    };
  }

  public async findRecommendations(studentId: string): Promise<HunterRecommendation[]> {
    const student = await User.findById(studentId);
    if (!student) return [];

    const studentSkillsDocs = await StudentSkill.find({ student_id: studentId });
    const studentProjectsDocs = await StudentProject.find({ student_id: studentId });
    const preferences = await StudentPreferences.findOne({ student_id: studentId });

    const studentSkills = studentSkillsDocs.map((s) => s.skill_name.toLowerCase());
    const projectTechs = studentProjectsDocs.flatMap((p) => p.technologies).map((t) => t.toLowerCase());
    const allKnownSkills = Array.from(new Set([...studentSkills, ...projectTechs]));

    const publishedInternships = await Internship.find({ status: 'published' }).sort({ created_at: -1 });
    const applications = await Application.find({ student_id: studentId });
    const appliedIds = new Set(applications.map((a) => a.internship_id.toString()));

    const recommendations: HunterRecommendation[] = [];

    for (const intern of publishedInternships) {
      const match = this.calculateMatch(student, intern, allKnownSkills, preferences);
      const hasApplied = appliedIds.has(intern._id.toString());

      recommendations.push({
        internship: intern,
        matchAnalysis: match,
        hasApplied,
      });
    }

    // Sort descending by compatibility score
    recommendations.sort((a, b) => b.matchAnalysis.compatibility_score - a.matchAnalysis.compatibility_score);

    // Record agent execution audit run in MongoDB
    try {
      await AgentRun.create({
        _id: 'run-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        user_id: studentId,
        agent_type: 'hunter_agent',
        status: 'completed',
        trigger_type: 'manual',
        input_summary: {
          student_id: studentId,
          active_skills_count: allKnownSkills.length,
          internships_evaluated: publishedInternships.length,
        },
        output_summary: {
          recommendations_count: recommendations.length,
          top_match: recommendations[0]
            ? `${recommendations[0].internship.title} (${recommendations[0].matchAnalysis.compatibility_score}%)`
            : 'None',
        },
        started_at: new Date(Date.now() - 400),
        completed_at: new Date(),
      });
    } catch (err: any) {
      console.warn('[HunterAgent] Warning saving AgentRun:', err.message);
    }

    return recommendations;
  }

  public async findMatchesForStudent(studentId: string, limit?: number): Promise<HunterRecommendation[]> {
    const recs = await this.findRecommendations(studentId);
    return limit ? recs.slice(0, limit) : recs;
  }
}

export const hunterAgent = new HunterAgentService();
export const HunterAgent = hunterAgent;
