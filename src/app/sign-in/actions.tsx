'use server';

import { z } from 'zod';
import argon2 from 'argon2';
import { createJWTTokens, setAuthCookies } from '@/auth/helpers';
import { redirect } from 'next/navigation';
import { db } from '../../../drizzle/client';
import { User, userTable } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { updateActiveUser } from '@/auth/server-actions';

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
    const userResponse = await selectUserByUsername({ username: userPayload.userName });

    if (userResponse.length == 0) return mismatchError;

    const selectedUser = userResponse[0];
    const matchPasswords = await argon2.verify(selectedUser.password, userPayload.password);

    if (!matchPasswords) return mismatchError;

    const { accessToken, refreshToken } = await createJWTTokens({ user: selectedUser });

    await updateActiveUser({ accessToken, refreshToken, user: selectedUser });
    await setAuthCookies(selectedUser);

    return redirect('./dashboard');
  } catch (error) {
    console.error('Error occurred during sign-in:', error);
  }

  redirect('./dashboard');
}

const formDataScheme = z.object({
  userName: z.string().min(6).max(20),
  password: z.string().min(6).max(20),
});

export async function selectUserByUsername({
  username,
}: {
  username: User['username'];
}): Promise<User[]> {
  try {
    return await db
      .select()
      .from(userTable)
      .where(eq(userTable.username, username))
      .limit(1)
      .execute();
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

const mismatchError = {
  errors: {
    userName: ["Username or password don't match"],
    password: [],
  },
};
