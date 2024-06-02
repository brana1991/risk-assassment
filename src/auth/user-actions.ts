'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/root/drizzle/client';
import { User, userTable } from '@/root/drizzle/schema';
import { Argon2 } from '@/app/sign-up/actions';
import { decodeJWT } from './auth-actions';
import { importSPKI } from 'jose';

const spki = process.env.JWT_ACCESS_PUBLIC_SECRET;

type UserPayload = {
  userName: string;
  password: string;
  email: string;
};

export async function registerUser(userPayload: UserPayload, hashFunction: Argon2['hash']) {
  const hashedPassword = await hashFunction(userPayload.password);
  let userId: number;

  try {
    const result = await db
      .insert(userTable)
      .values({
        createdAt: new Date().toISOString(),
        email: userPayload.email,
        username: userPayload.userName,
        password: hashedPassword,
      })
      .returning({ id: userTable.id })
      .execute();

    userId = result[0].id;
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

export async function selectUserByUsername({
  username,
}: {
  username: User['username'];
}): Promise<Promise<User> | null> {
  let userResponse;
  try {
    userResponse = await db
      .select()
      .from(userTable)
      .where(eq(userTable.username, username))
      .limit(1)
      .execute();

    if (userResponse.length == 0) return null;
  } catch (error) {
    throw new Error((error as Error).message);
  }

  return userResponse[0];
}

type UpdateParams = { accessToken: string; refreshToken: string; username: User['username'] };

export async function updateActiveUser({ accessToken, refreshToken, username }: UpdateParams) {
  try {
    await db
      .update(userTable)
      .set({
        accessToken,
        refreshToken,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userTable.username, username))
      .execute();
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export async function selectLoggedInUser({
  accessToken,
}: {
  accessToken: string | undefined;
}): Promise<User | null> {
  let user;
  try {
    if (!accessToken) return null;

    const accessTokenPublicKey = await importSPKI(spki as string, 'RS256');
    const accessTokenDecoded = await decodeJWT(accessToken, accessTokenPublicKey);

    if (!accessTokenDecoded?.payload.sub) return null;

    user = await selectUserByUsername({ username: accessTokenDecoded.payload.sub });
  } catch (error) {
    console.error('Error fetching logged-in user:', error);
    throw new Error('Failed to fetch logged-in user.');
  }
  return user;
}

export async function getTokensByUsername({
  username,
}: {
  username: User['username'];
}): Promise<{ accessToken: User['accessToken']; refreshToken: User['refreshToken'] } | null> {
  try {
    const tokensResponse = await db
      .select({ accessToken: userTable.accessToken, refreshToken: userTable.refreshToken })
      .from(userTable)
      .where(eq(userTable.username, username))
      .limit(1)
      .execute();

    if (tokensResponse.length == 0) return null;
    return tokensResponse[0];
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
