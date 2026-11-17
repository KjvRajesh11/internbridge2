import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { seedDatabase } from './scripts/seed.js';
async function startServer() {
    try {
        console.log('Connecting to MongoDB...');
        await connectDatabase();
        // Auto-seed if database is freshly initialized or empty
        await seedDatabase();
        const server = app.listen(env.PORT, () => {
            console.log(`\n=================================================`);
            console.log(`  INTERNBRIDGE MERN BACKEND SERVER READY`);
            console.log(`  Environment: ${env.NODE_ENV}`);
            console.log(`  Port:        ${env.PORT}`);
            console.log(`  API Base:    http://localhost:${env.PORT}/api/v1`);
            console.log(`=================================================\n`);
        });
        const shutdown = async (signal) => {
            console.log(`\nReceived ${signal}. Shutting down gracefully...`);
            server.close(async () => {
                await disconnectDatabase();
                console.log('Server and database connections closed cleanly.');
                process.exit(0);
            });
        };
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
startServer();
