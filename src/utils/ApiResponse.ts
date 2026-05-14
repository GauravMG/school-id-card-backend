export const apiResponse = <T>(message: string, data?: T) => ({
    success: true,
    message,
    data
});
