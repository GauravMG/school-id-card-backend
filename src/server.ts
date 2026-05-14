import { app } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const start = async () => {
    try {
        await prisma.$connect();
        app.listen(env.PORT, () => {
            console.log(`Server running on port ${env.PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
};

start();
