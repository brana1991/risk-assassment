'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/root/drizzle/client';
import { Session, User, sessionTable, userTable } from '@/root/drizzle/schema';
import { Argon2 } from '@/app/sign-up/actions';
import { decodeJWT, deleteSessionFromDB } from './auth-actions';
import { cookies } from 'next/headers';

import { v4 as uuidv4 } from 'uuid';

type UserPayload = {
  userName: string;
  password: string;
  email: string;
};

export async function insertUser(userPayload: UserPayload, hashFunction: Argon2['hash']) {
  const hashedPassword = await hashFunction(userPayload.password);
  const id = uuidv4();

  try {
    await db
      .insert(userTable)
      .values({
        id,
        username: userPayload.userName,
        password: hashedPassword,
        email: userPayload.email,
        createdAt: new Date().toISOString(),
      })
      .returning({ id: userTable.id })
      .execute();
  } catch (error) {
    console.error('Error occurred during user registration:', error);
    throw new Error('Failed to register user.');
  }
}

type SelectProps = { username: User['username'] };

export async function selectUser({ username }: SelectProps): Promise<Promise<User> | null> {
  try {
    const userResponse = await db
      .select()
      .from(userTable)
      .where(eq(userTable.username, username))
      .limit(1)
      .execute();

    if (userResponse.length == 0) return null;

    return userResponse[0];
  } catch (error) {
    console.log('Error selecting user', error);
    throw new Error((error as Error).message);
  }
}

export async function logoutUser() {
  try {
    const accessToken = cookies().get('accessToken')?.value as string;
    const decodedJWT = await decodeJWT(accessToken);
    const sessionId = decodedJWT?.kid as string;

    const removedSession = await deleteSessionFromDB({ sessionId });

    return removedSession;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export async function getCurrentUser() {
  const accessTokenCookie = cookies().get('accessToken')?.value as string;
  const decodedJWT = await decodeJWT(accessTokenCookie);
  const sessionId = decodedJWT?.kid as string;

  try {
    const sessions: Session[] = await db
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.sessionId, sessionId))
      .limit(1)
      .execute();

    if (!sessions.length) {
      return null;
    }
    const session = sessions[0];

    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, session.userId as string))
      .limit(1)
      .execute();

    return user[0];
  } catch (error) {
    console.error('Error retrieving current user:', error);
    return null;
  }
}
