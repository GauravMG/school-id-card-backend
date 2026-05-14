export type AuthUser = {
    userId: string;
    role: 'SUPERADMIN' | 'SCHOOL_STAFF';
    schoolId?: string | null;
    actingAsSchoolId?: string | null;
    actingAsStaffId?: string | null;
    originalSuperAdminId?: string | null;
};
