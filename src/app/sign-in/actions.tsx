'use server';

import { z } from 'zod';
import argon2 from 'argon2';
import { createJWTTokens, setAuthCookies } from '@/auth/auth-actions';
import { selectUserByUsername, updateActiveUser } from '@/auth/user-actions';
import { redirect } from 'next/navigation';

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
    const selectedUser = await selectUserByUsername({ username: userPayload.userName });

    if (!selectedUser) return mismatchError;
    const matchPasswords = await argon2.verify(selectedUser.password, userPayload.password);

    if (!matchPasswords) return mismatchError;

    const { accessToken, refreshToken } = await createJWTTokens({
      username: selectedUser.username,
    });

    await updateActiveUser({ accessToken, refreshToken, username: selectedUser.username });
    await setAuthCookies(selectedUser.username);

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
