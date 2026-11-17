import { IUser, IInternship } from '../../models/index.js';
import { MatchAnalysis } from '@shared/types/index.js';
export interface HunterRecommendation {
    internship: IInternship;
    matchAnalysis: MatchAnalysis;
    aiExplanation?: string;
    hasApplied: boolean;
}
export declare class HunterAgentService {
    /**
     * Deterministic weighted matching algorithm:
     * Required skill alignment: 40%
     * Preferred skill alignment: 20%
     * Role and interest alignment: 15%
     * Educational alignment: 10%
     * Location and work-mode alignment: 10%
     * Duration and availability alignment: 5%
     */
    calculateMatch(student: IUser, internship: IInternship, skills: string[], preferences?: any): MatchAnalysis;
    findRecommendations(studentId: string): Promise<HunterRecommendation[]>;
    findMatchesForStudent(studentId: string, limit?: number): Promise<HunterRecommendation[]>;
}
export declare const hunterAgent: HunterAgentService;
export declare const HunterAgent: HunterAgentService;
