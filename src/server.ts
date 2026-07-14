import { app } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';
import { startJobWorker } from './services/job-queue.service';
import { processStudentPhotoJob } from './services/student-photo-processor.service';

const start = async () => {
    try {
        await prisma.$connect();
        startJobWorker((job) => processStudentPhotoJob(job.studentId, job.photoAssetId));
        app.listen(env.PORT, () => {
            console.log(`Server running on port ${env.PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
};

start();
