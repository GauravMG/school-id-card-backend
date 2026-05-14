export const getPagination = (page?: string, limit?: string) => {
    const currentPage = Math.max(Number(page || 1), 1);
    const perPage = Math.min(Math.max(Number(limit || 20), 1), 100);
    return {
        skip: (currentPage - 1) * perPage,
        take: perPage,
        page: currentPage,
        limit: perPage
    };
};
