import { z } from 'zod';

const emailValidation = z
  .string({ required_error: 'Email is required' })
  .email('Email in invalid');

const passwordValidation = z
  .string({
    required_error: 'Password is required',
  })
  .min(8, 'Password must be more than 8 characters')
  .max(32, 'Password must be less than 32 characters');

export const RegisterUserSchema = z.object({
  name: z.string({ required_error: 'Name is required' }),
  email: emailValidation,
  password: passwordValidation,
});

export const LoginUserSchema = z.object({
  email: emailValidation,
  password: passwordValidation,
});

export type LoginUserInput = z.infer<typeof LoginUserSchema>;
export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
