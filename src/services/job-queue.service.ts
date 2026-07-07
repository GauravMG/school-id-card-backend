import { ProcessingJob, ProcessingJobStatus, ProcessingJobType } from '@prisma/client';
import { prisma } from '../lib/prisma';

/**
 * Minimal DB-backed job queue. There's no Redis/Bull in this stack, and at this
 * project's scale a single in-process poller claiming one row at a time is
 * enough — the `updateMany` claim guard below prevents two ticks (or a
 * respawned dev-server instance) from double-processing the same job.
 */

export const enqueuePhotoCompositeJob = async (studentId: string, photoAssetId: string): Promise<ProcessingJob> => {
    return prisma.processingJob.create({
        data: {
            type: ProcessingJobType.STUDENT_PHOTO_COMPOSITE,
            studentId,
            photoAssetId,
            status: ProcessingJobStatus.PENDING
        }
    });
};

export const getLatestJobForStudent = async (studentId: string): Promise<ProcessingJob | null> => {
    return prisma.processingJob.findFirst({
        where: { studentId, type: ProcessingJobType.STUDENT_PHOTO_COMPOSITE },
        orderBy: { createdAt: 'desc' }
    });
};

const claimNextPendingJob = async (): Promise<ProcessingJob | null> => {
    const candidate = await prisma.processingJob.findFirst({
        where: { status: ProcessingJobStatus.PENDING },
        orderBy: { createdAt: 'asc' }
    });
    if (!candidate) return null;

    const claim = await prisma.processingJob.updateMany({
        where: { id: candidate.id, status: ProcessingJobStatus.PENDING },
        data: { status: ProcessingJobStatus.PROCESSING }
    });
    if (claim.count === 0) return null;

    return { ...candidate, status: ProcessingJobStatus.PROCESSING };
};

let tickInFlight = false;
let workerTimer: ReturnType<typeof setInterval> | null = null;

export const startJobWorker = (handler: (job: ProcessingJob) => Promise<void>, intervalMs = 3000): void => {
    if (workerTimer) return;

    workerTimer = setInterval(async () => {
        if (tickInFlight) return;
        tickInFlight = true;

        try {
            const job = await claimNextPendingJob();
            if (!job) return;

            try {
                await handler(job);
                await prisma.processingJob.update({
                    where: { id: job.id },
                    data: { status: ProcessingJobStatus.COMPLETED }
                });
            } catch (err) {
                console.error(`[job-queue] job ${job.id} failed:`, err);
                await prisma.processingJob.update({
                    where: { id: job.id },
                    data: {
                        status: ProcessingJobStatus.FAILED,
                        attempts: { increment: 1 },
                        error: String((err as Error)?.message ?? err).slice(0, 500)
                    }
                });
            }
        } catch (err) {
            console.error('[job-queue] worker tick failed:', err);
        } finally {
            tickInFlight = false;
        }
    }, intervalMs);
};

export const stopJobWorker = (): void => {
    if (workerTimer) {
        clearInterval(workerTimer);
        workerTimer = null;
    }
};
