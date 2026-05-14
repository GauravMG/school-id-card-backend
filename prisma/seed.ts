import { PrismaClient, UserRole, Gender } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const templates = Array.from({ length: 10 }, (_, i) => ({
    id: `template-${i + 1}`,
    name: `Template ${i + 1}`
}));

async function main() {
    const passwordHash = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD || 'Admin@12345', 10);

    const existingAdmin = await prisma.user.findUnique({
        where: { email: process.env.SUPERADMIN_EMAIL || 'admin@example.com' }
    });

    if (!existingAdmin) {
        await prisma.user.create({
            data: {
                name: 'Super Admin',
                email: process.env.SUPERADMIN_EMAIL || 'admin@example.com',
                passwordHash,
                role: UserRole.SUPERADMIN
            }
        });
    }

    console.log('Seed complete');
    console.log('Templates available in code registry:', templates.map((t) => t.id).join(', '));
    console.log('Master classes: Nursery, LKG, UKG, 1-12');
    console.log('Master sections: A-E');
    console.log('Sample genders:', Object.values(Gender).join(', '));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
