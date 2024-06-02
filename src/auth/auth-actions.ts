import {
  importPKCS8,
  JWTPayload,
  jwtVerify,
  JWTVerifyOptions,
  JWTVerifyResult,
  KeyLike,
  SignJWT,
} from 'jose';
import { tokenTable, User } from '../../drizzle/schema';
import { cookies } from 'next/headers';
import { db } from '@/root/drizzle/client';
import { eq } from 'drizzle-orm';

const claims = {
  protectedHeader: {
    alg: 'RS256',
    typ: 'JWT',
    cty: 'JWT',
    kid: '12345',
  },
  iss: 'Majstor Brana',
  iat: Math.floor(Date.now()),
};

type JWTTokens = { accessToken: string; refreshToken: string };

export async function createJWTTokens({
  username,
}: {
  username: User['username'];
}): Promise<JWTTokens> {
  if (!process.env.JWT_ACCESS_PRIVATE_SECRET || !process.env.JWT_REFRESH_PRIVATE_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  if (!username) {
    throw new Error('User unavailable');
  }

  try {
    const alg = 'RS256';
    const pkcs8Access = process.env.JWT_ACCESS_PRIVATE_SECRET;
    const accessTokenPrivateKey = await importPKCS8(pkcs8Access, alg);

    const pkcs8ARefresh = process.env.JWT_REFRESH_PRIVATE_SECRET;
    const refreshTokenPrivateKey = await importPKCS8(pkcs8ARefresh, alg);

    const accessToken = await new SignJWT()
      .setProtectedHeader(claims.protectedHeader)
      .setIssuedAt(claims.iat)
      .setExpirationTime('5s')
      .setIssuer(claims.iss)
      .setAudience('Clients access token')
      .setSubject(username)
      .sign(accessTokenPrivateKey);

    const refreshToken = await new SignJWT()
      .setProtectedHeader(claims.protectedHeader)
      .setIssuedAt(claims.iat)
      .setExpirationTime('72h')
      .setIssuer(claims.iss)
      .setAudience('Clients refresh token')
      .setSubject(username)
      .sign(refreshTokenPrivateKey);

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new Error('Failed to generate JWT tokens');
  }
}

export async function decodeJWT(
  token: string,
  publicKey: KeyLike | Uint8Array,
  options?: JWTVerifyOptions,
): Promise<JWTVerifyResult<JWTPayload> | { invalidToken: boolean }> {
  try {
    return await jwtVerify(token, publicKey, options);
  } catch (error) {
    if ((error as { code: string }).code === 'ERR_JWT_EXPIRED') {
      return jwtVerify(token, publicKey, { ...options, currentDate: new Date(0) });
    }
    return { invalidToken: true };
  }
}

export async function setAuthCookies(username: User['username']) {
  const { accessToken, refreshToken } = await createJWTTokens({ username });

  if (accessToken && refreshToken) {
    cookies().set('accessToken', accessToken, {
      secure: true,
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
    });

    cookies().set('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
    });
  }
}

export async function issueNewAccessToken(
  refreshToken: string,
  refreshTokenPublicSecret: KeyLike,
  username: User['username'],
) {
  try {
    const decodedRefreshToken = await decodeJWT(refreshToken, refreshTokenPublicSecret);

    if (!decodedRefreshToken) {
      throw new Error('Invalid refresh token');
    }

    const { accessToken } = await createJWTTokens({ username });

    return accessToken;
  } catch (error) {
    console.error('Error issuing new access token:', error);
    throw new Error('Failed to issue new access token');
  }
}

export async function insertTokens(
  userId: number,
  accessToken: string,
  refreshToken: string,
  expiresAt: string,
) {
  const now = new Date().toISOString();

  await db
    .insert(tokenTable)
    .values({
      userId,
      accessToken,
      refreshToken,
      expiresAt,
      createdAt: now,
    })
    .execute();
}
export async function validateToken(accessToken: string, refreshToken: string) {
  const tokenRecord = await db
    .select()
    .from(tokenTable)
    .where(eq(tokenTable.accessToken, accessToken))
    .limit(1)
    .execute();

  if (!tokenRecord.length) return false;

  const tokenData = tokenRecord[0];
  const isAccessTokenExpired = new Date(tokenData.expiresAt) < new Date();

  if (isAccessTokenExpired) {
    return false;
  }

  return tokenData.refreshToken === refreshToken;
}

export async function updateTokens(
  userId: number,
  accessToken: string,
  refreshToken: string,
  expiresAt: string,
) {
  await db
    .update(tokenTable)
    .set({
      accessToken,
      refreshToken,
      expiresAt,
    })
    .where(eq(tokenTable.userId, userId))
    .execute();
}
