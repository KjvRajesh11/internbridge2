export interface SubmitApplicationResult {
    success: boolean;
    applicationId?: string;
    application?: any;
    message: string;
    reasons?: string[];
}
export declare class ExecutionAgentService {
    /**
     * Executes application submission with complete eligibility and duplicate checks.
     */
    submitApplication(params: {
        studentId: string;
        internshipId: string;
        mode?: 'assisted' | 'autonomous_auto_apply';
        coverLetter?: string;
        answers?: Record<string, string>;
    }): Promise<SubmitApplicationResult>;
    /**
     * Scans eligible listings and executes pre-authorized auto-applications within candidate limits.
     */
    runAutonomousAutoApply(studentId: string): Promise<{
        evaluated: number;
        submitted: number;
        applications: any[];
        failures: Array<{
            internshipId: string;
            title: string;
            reasons: string[];
        }>;
    }>;
    runAutoApplyBatch(studentId: string): Promise<{
        evaluated: number;
        submitted: number;
        applications: any[];
        failures: Array<{
            internshipId: string;
            title: string;
            reasons: string[];
        }>;
    }>;
}
export declare const executionAgent: ExecutionAgentService;
export declare const ExecutionAgent: ExecutionAgentService;
