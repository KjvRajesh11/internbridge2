import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export function generateAccessToken(payload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
}
export function generateRefreshToken(payload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}
export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, env.JWT_ACCESS_SECRET);
    }
    catch {
        return null;
    }
}
export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, env.JWT_REFRESH_SECRET);
    }
    catch {
        return null;
    }
}
