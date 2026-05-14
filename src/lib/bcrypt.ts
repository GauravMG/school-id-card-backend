import bcrypt from 'bcrypt';

export const hashValue = (value: string) => bcrypt.hash(value, 10);
export const compareValue = (value: string, hash: string) => bcrypt.compare(value, hash);
