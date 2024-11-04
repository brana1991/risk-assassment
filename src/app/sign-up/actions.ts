'use server';
import { insertUser } from '@/auth/user-actions';
import argon2 from 'argon2';
import { redirect } from 'next/navigation';
import { z } from 'zod';
export type Argon2 = typeof argon2;

export type FormState = {
  errors: {
    userName?: string[];
    password?: string[];
    email?: string[];
  };
};

export async function signUp(_: FormState, formData: FormData) {
  const { data: userPayload, error } = formDataScheme.safeParse({
    userName: formData.get('userName'),
    password: formData.get('password'),
    email: formData.get('email'),
  });

  if (error) {
    return {
      errors: error.flatten().fieldErrors,
    };
  }

  try {
    await insertUser(userPayload, argon2.hash);
  } catch (error) {
    console.error(error);
    throw error;
  }

  redirect('./sign-in');
}

const formDataScheme = z.object({
  userName: z.string().min(6).max(20),
  password: z.string().min(6).max(20),
  email: z.string().email(),
});
