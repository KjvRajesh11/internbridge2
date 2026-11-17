export declare class CareerOpsAgentService {
    /**
     * Identifies applications that have remained in review beyond standard response targets (7+ days).
     */
    analyzeReviewDwellTimes(studentId: string): Promise<Array<{
        applicationId: string;
        internshipTitle: string;
        companyName: string;
        daysInReview: number;
        needsFollowUp: boolean;
        status: string;
    }>>;
    /**
     * Generates a polite, professional follow-up note for stalled applications.
     */
    generateFollowUpMessage(applicationId: string): Promise<{
        message: string;
        source: string;
    }>;
    /**
     * Generates tailored technical and behavioral mock interview questions.
     */
    generateInterviewPrepSheet(params: {
        studentId: string;
        internshipId: string;
    }): Promise<{
        technicalQuestions: Array<{
            question: string;
            focusArea: string;
            modelAnswerTip: string;
        }>;
        behavioralQuestions: Array<{
            question: string;
            competency: string;
            starGuidance: string;
        }>;
        companyBrief: string;
    }>;
    /**
     * Evaluates candidate mock interview answers against a STAR framework rubric.
     */
    evaluateMockAnswer(params: {
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
    }>;
    generateInterviewPrepPack(studentId: string, internshipId: string): Promise<{
        technicalQuestions: Array<{
            question: string;
            focusArea: string;
            modelAnswerTip: string;
        }>;
        behavioralQuestions: Array<{
            question: string;
            competency: string;
            starGuidance: string;
        }>;
        companyBrief: string;
    }>;
    evaluateMockResponse(question: string, candidateResponse: string): Promise<{
        overallScore: number;
        starAnalysis: {
            situationClarity: number;
            actionRigor: number;
            resultQuantified: number;
        };
        strengths: string[];
        improvements: string[];
        coachingFeedback: string;
    }>;
}
export declare const careerOpsAgent: CareerOpsAgentService;
export declare const CareerOpsAgent: CareerOpsAgentService;
