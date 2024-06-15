import {z} from 'zod';

export const signInSchema = z.object({
    identifier: z.string(), // We can also write 'email' in place of 'identifier'
    password: z.string()
})