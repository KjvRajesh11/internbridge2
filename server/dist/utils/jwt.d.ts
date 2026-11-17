import { UserRole } from '@shared/types/index.js';
export interface TokenPayload {
    userId: string;
    role: UserRole;
    email: string;
}
export declare function generateAccessToken(payload: TokenPayload): string;
export declare function generateRefreshToken(payload: TokenPayload): string;
export declare function verifyAccessToken(token: string): TokenPayload | null;
export declare function verifyRefreshToken(token: string): TokenPayload | null;
