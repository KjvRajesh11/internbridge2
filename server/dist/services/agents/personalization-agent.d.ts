export declare class PersonalizationAgentService {
    /**
     * Generates a tailored cover letter referencing ONLY verified candidate projects and declared skills.
     * Zero hallucination: strictly bounded to true candidate profile.
     */
    generateTailoredCoverLetter(params: {
        studentId: string;
        internshipId: string;
    }): Promise<{
        content: string;
        source: string;
        documentId?: string;
    }>;
    /**
     * Generates tailored screening question responses referencing real candidate experience.
     */
    generateScreeningAnswer(params: {
        studentId: string;
        question: string;
        internshipId?: string;
    }): Promise<{
        answer: string;
        source: string;
    }>;
    generateCoverLetter(studentId: string, internshipId: string): Promise<string>;
    generateScreeningResponse(studentId: string, internshipId: string, question: string): Promise<string>;
}
export declare const personalizationAgent: PersonalizationAgentService;
export declare const PersonalizationAgent: PersonalizationAgentService;
