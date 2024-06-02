'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/root/drizzle/client';
import { User, userTable } from '@/root/drizzle/schema';
import { Argon2 } from '@/app/sign-up/actions';

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
    console.log('tu sam');
    throw new Error((error as Error).message);
  }
}

type UpdateParams = { username: User['username']; isLoggedIn: number };

export async function updateUser({ username, isLoggedIn }: UpdateParams) {
  try {
    await db
      .update(userTable)
      .set({
        updatedAt: new Date().toISOString(),
        isLoggedIn,
      })
      .where(eq(userTable.username, username))
      .execute();
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export async function logoutUser({ isLoggedIn }: { isLoggedIn: number }) {
  try {
    await db
      .update(userTable)
      .set({
        updatedAt: new Date().toISOString(),
        isLoggedIn,
      })
      .where(eq(userTable.isLoggedIn, 1))
      .execute();
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export async function selectLoggedInUser() {
  try {
    const user = await db
      .select({
        id: userTable.id,
        email: userTable.email,
        username: userTable.username,
        isLoggedIn: userTable.isLoggedIn,
      })
      .from(userTable)
      .where(eq(userTable.isLoggedIn, 1))
      .execute()
      .then((result) => result[0]);

    return user;
  } catch (error) {
    console.error('Error selecting logged-in user:', error);
    return null;
  }
}
