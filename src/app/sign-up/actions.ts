'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import argon2 from 'argon2';
import { db } from '../../../drizzle/client';
import { User, userTable } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

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
    await registerUser(userPayload);
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

interface Params {
  userName: string;
  password: string;
  email: string;
}

export async function registerUser(userPayload: Params) {
  const hashedPassword = await argon2.hash(userPayload.password);
  let userId: number;

  try {
    const result = await db
      .insert(userTable)
      .values({
        createdAt: new Date().toISOString(), // Store as ISO string
        email: userPayload.email,
        username: userPayload.userName,
        password: hashedPassword,
      })
      .returning({ id: userTable.id }) // Return the ID of the inserted user
      .execute();

    userId = result[0].id;

    console.log({ result });
  } catch (error) {
    console.error('Error occurred during user registration:', error);
    throw new Error('Failed to register user.');
  }

  const createdUser = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1)
    .execute();

  if (createdUser.length === 0) {
    throw new Error('User not found after registration.');
  }

  return createdUser[0];
}
