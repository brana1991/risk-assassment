import { KeyLike } from 'jose';
import { createJWTTokens, decodeJWT } from './helpers';
import { db } from '../../drizzle/client';
import { User, userTable } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function issueNewAccessToken(
  refreshToken: string,
  refreshTokenPublicSecret: KeyLike,
  user: User,
) {
  try {
    const decodedRefreshToken = await decodeJWT(refreshToken, refreshTokenPublicSecret);

    if (!decodedRefreshToken) {
      throw new Error('Invalid refresh token');
    }

    const { accessToken } = await createJWTTokens({ user });

    return accessToken;
  } catch (error) {
    console.error('Error issuing new access token:', error);
    throw new Error('Failed to issue new access token');
  }
}

type Params = { accessToken: string; refreshToken: string; user: User };

export async function updateActiveUser({ accessToken, refreshToken, user }: Params) {
  try {
    await db
      .update(userTable)
      .set({
        accessToken,
        refreshToken,
        updatedAt: new Date().toISOString(),
        isActive: 1,
      })
      .where(eq(userTable.id, user.id))
      .execute();
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
