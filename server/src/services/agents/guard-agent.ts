import { User, Internship, Application, StudentPreferences, StudentDocument } from '../../models/index.js';

export interface GuardCheckResult {
  passed: boolean;
  checks: {
    internship_published: boolean;
    deadline_valid: boolean;
    no_duplicate_application: boolean;
    gpa_eligible: boolean;
    grad_year_eligible: boolean;
    degree_eligible: boolean;
    permissions_valid: boolean;
    documents_ready: boolean;
  };
  failureReasons: string[];
  explanation: string;
}

export class GuardAgentService {
  /**
   * Deterministically validates all application eligibility and integrity rules.
   * This logic CANNOT be overridden by an AI model.
   */
  public async evaluateEligibility(params: {
    studentId: string;
    internshipId: string;
    isAutoApply?: boolean;
  }): Promise<GuardCheckResult> {
    const student = await User.findById(params.studentId);
    const internship = await Internship.findById(params.internshipId);
    const preferences = await StudentPreferences.findOne({ student_id: params.studentId });
    const studentDocs = await StudentDocument.find({ student_id: params.studentId });

    const failureReasons: string[] = [];

    if (!student) {
      return {
        passed: false,
        checks: {
          internship_published: false,
          deadline_valid: false,
          no_duplicate_application: false,
          gpa_eligible: false,
          grad_year_eligible: false,
          degree_eligible: false,
          permissions_valid: false,
          documents_ready: false,
        },
        failureReasons: ['Student profile not found.'],
        explanation: 'The student profile could not be retrieved from the database.',
      };
    }

    if (!internship) {
      return {
        passed: false,
        checks: {
          internship_published: false,
          deadline_valid: false,
          no_duplicate_application: false,
          gpa_eligible: false,
          grad_year_eligible: false,
          degree_eligible: false,
          permissions_valid: false,
          documents_ready: false,
        },
        failureReasons: ['Internship not found.'],
        explanation: 'The requested internship listing does not exist.',
      };
    }

    // 1. Internship Published Check
    const internshipPublished = internship.status === 'published';
    if (!internshipPublished) {
      failureReasons.push(`Internship is currently ${internship.status} and not accepting applications.`);
    }

    // 2. Deadline Check
    const deadline = new Date(internship.application_deadline);
    const deadlineValid = deadline.getTime() >= Date.now();
    if (!deadlineValid) {
      failureReasons.push(`The application deadline for this position passed on ${deadline.toLocaleDateString()}.`);
    }

    // 3. Duplicate Application Rule (Non-negotiable key business rule)
    const existingApplication = await Application.findOne({
      student_id: params.studentId,
      internship_id: params.internshipId,
    });
    const noDuplicate = !existingApplication;
    if (!noDuplicate) {
      failureReasons.push(
        'A student cannot apply to the same internship more than once. An application record already exists for this position.'
      );
    }

    // 4. GPA Cutoff Check
    let gpaEligible = true;
    if (internship.minimum_gpa && internship.minimum_gpa > 0) {
      if (!student.gpa || student.gpa < internship.minimum_gpa) {
        gpaEligible = false;
        failureReasons.push(
          `Minimum GPA requirement is ${internship.minimum_gpa.toFixed(2)}. Your declared GPA is ${
            student.gpa ? student.gpa.toFixed(2) : 'not provided'
          }.`
        );
      }
    }

    // 5. Graduation Year Check
    let gradYearEligible = true;
    if (internship.accepted_graduation_years && internship.accepted_graduation_years.length > 0) {
      if (!student.graduation_year || !internship.accepted_graduation_years.includes(student.graduation_year)) {
        gradYearEligible = false;
        failureReasons.push(
          `Internship accepts cohorts: [${internship.accepted_graduation_years.join(', ')}]. Your cohort is ${
            student.graduation_year || 'unspecified'
          }.`
        );
      }
    }

    // 6. Degree Check
    let degreeEligible = true;
    const allowedDegrees = internship.eligibility_rules?.allowed_degrees;
    if (allowedDegrees && allowedDegrees.length > 0) {
      if (!student.degree || !allowedDegrees.some((d) => d.toLowerCase() === student.degree?.toLowerCase())) {
        degreeEligible = false;
        failureReasons.push(`Accepted degrees: [${allowedDegrees.join(', ')}]. Your declared degree is ${student.degree || 'none'}.`);
      }
    }

    // 7. Auto-Apply Permissions Check (if applicable)
    let permissionsValid = true;
    if (params.isAutoApply) {
      if (!preferences?.auto_apply_enabled) {
        permissionsValid = false;
        failureReasons.push('Automated submission is blocked because auto-apply is disabled in candidate preferences.');
      }
    }

    // 8. Documents Ready Check
    const hasResume = studentDocs.some((d) => d.document_type === 'resume' || d.is_primary);
    const documentsReady = hasResume;
    if (!documentsReady) {
      failureReasons.push('No verified resume found in candidate portfolio. Please upload a resume before applying.');
    }

    const passed =
      internshipPublished &&
      deadlineValid &&
      noDuplicate &&
      gpaEligible &&
      gradYearEligible &&
      degreeEligible &&
      permissionsValid &&
      documentsReady;

    return {
      passed,
      checks: {
        internship_published: internshipPublished,
        deadline_valid: deadlineValid,
        no_duplicate_application: noDuplicate,
        gpa_eligible: gpaEligible,
        grad_year_eligible: gradYearEligible,
        degree_eligible: degreeEligible,
        permissions_valid: permissionsValid,
        documents_ready: documentsReady,
      },
      failureReasons,
      explanation: passed
        ? 'All deterministic eligibility, deadline, and single-application integrity checks passed.'
        : `Application integrity guard blocked submission: ${failureReasons.join(' ')}`,
    };
  }

  public async verifyEligibility(studentId: string, internshipId: string) {
    const res = await this.evaluateEligibility({ studentId, internshipId });
    return {
      score: 85,
      reasons: res.failureReasons,
      ...res,
    };
  }
}

export const guardAgent = new GuardAgentService();
export const GuardAgent = guardAgent;
