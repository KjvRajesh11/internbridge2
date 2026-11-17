import { ZodError } from 'zod';
export function errorHandler(err, req, res, next) {
    // 1. MongoDB Duplicate Key (E11000)
    if (err.code === 11000 || err.name === 'MongoServerError' && err.message?.includes('E11000')) {
        // Specifically handle the core platform rule: unique student internship application
        if (err.message?.includes('unique_student_internship_application') || err.keyPattern?.student_id) {
            return res.status(409).json({
                success: false,
                error: 'A student cannot apply to the same internship more than once.',
                code: 'DUPLICATE_APPLICATION',
            });
        }
        return res.status(409).json({
            success: false,
            error: 'Duplicate record already exists in database.',
            code: 'DUPLICATE_KEY',
        });
    }
    // 2. Custom Duplicate Application Error from services
    if (err.code === 'DUPLICATE_APPLICATION') {
        return res.status(409).json({
            success: false,
            error: err.message || 'A student cannot apply to the same internship more than once.',
            code: 'DUPLICATE_APPLICATION',
        });
    }
    // 3. Zod Validation Errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
    }
    // 4. General Bad Request
    if (err.status && err.status < 500) {
        return res.status(err.status).json({
            success: false,
            error: err.message,
        });
    }
    // 5. Unhandled Internal Server Errors
    console.error('[Unhandled Server Error]:', err);
    return res.status(500).json({
        success: false,
        error: err.message || 'Internal Server Error',
    });
}
