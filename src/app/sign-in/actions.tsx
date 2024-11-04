'use server';

import { z } from 'zod';
import argon2 from 'argon2';
import { createJWTTokens, createSession, setAuthCookies } from '@/auth/auth-actions';
import { selectUser } from '@/auth/user-actions';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export type FormState = {
  errors: {
    userName?: Array<string> | undefined;
    password?: Array<string> | undefined;
  };
};

export async function signIn(_: FormState, formData: FormData) {
  const { data: userPayload, error } = formDataScheme.safeParse({
    userName: formData.get('userName'),
    password: formData.get('password'),
  });

  if (error) {
    return {
      errors: error.flatten().fieldErrors,
    };
  }

  try {
    const selectedUser = await selectUser({ username: userPayload.userName });

    if (!selectedUser) return mismatchError;

    const matchPasswords = await argon2.verify(selectedUser.password, userPayload.password);

    if (!matchPasswords) return mismatchError;

    const sessionId = uuidv4();

    const { accessToken, refreshToken } = await createJWTTokens({
      sessionId,
    });

    await createSession({
      accessToken,
      refreshToken,
      sessionId,
      userId: selectedUser.id,
    });

    await setAuthCookies(accessToken, refreshToken);

    return redirect('./dashboard');
  } catch (error) {
    console.error('Error occurred during sign-in:', error);
  }

  return redirect('./dashboard');
}

const formDataScheme = z.object({
  userName: z.string().min(6).max(20),
  password: z.string().min(6).max(20),
});

const mismatchError = {
  errors: {
    userName: ["Username or password don't match"],
    password: [],
  },
};
