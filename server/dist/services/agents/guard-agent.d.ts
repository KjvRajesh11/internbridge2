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
export declare class GuardAgentService {
    /**
     * Deterministically validates all application eligibility and integrity rules.
     * This logic CANNOT be overridden by an AI model.
     */
    evaluateEligibility(params: {
        studentId: string;
        internshipId: string;
        isAutoApply?: boolean;
    }): Promise<GuardCheckResult>;
    verifyEligibility(studentId: string, internshipId: string): Promise<{
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
        score: number;
        reasons: string[];
    }>;
}
export declare const guardAgent: GuardAgentService;
export declare const GuardAgent: GuardAgentService;
