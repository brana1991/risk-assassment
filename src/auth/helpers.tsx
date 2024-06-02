import {
  importPKCS8,
  JWTPayload,
  jwtVerify,
  JWTVerifyOptions,
  JWTVerifyResult,
  KeyLike,
  SignJWT,
} from 'jose';
import { User, userTable } from '../../drizzle/schema';
import { cookies } from 'next/headers';
import { db } from '../../drizzle/client';
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

export async function createJWTTokens({ user }: { user: User }): Promise<JWTTokens> {
  if (!process.env.JWT_ACCESS_PRIVATE_SECRET || !process.env.JWT_REFRESH_PRIVATE_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  if (!user) {
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
      .setExpirationTime('20s')
      .setIssuer(claims.iss)
      .setAudience('Clients access token')
      .setSubject(user.username)
      .sign(accessTokenPrivateKey);

    const refreshToken = await new SignJWT()
      .setProtectedHeader(claims.protectedHeader)
      .setIssuedAt(claims.iat)
      .setExpirationTime('72h')
      .setIssuer(claims.iss)
      .setAudience('Clients refresh token')
      .setSubject(user.username)
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
): Promise<JWTVerifyResult<JWTPayload & { exp: number }> | null> {
  try {
    return await jwtVerify(token, publicKey, options);
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function setAuthCookies(user: User) {
  const { accessToken, refreshToken } = await createJWTTokens({ user });

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

export async function selectAccessTokensByUser({
  username,
}: {
  username: User['username'];
}): Promise<{ accessToken: User['accessToken']; refreshToken: User['refreshToken'] } | null> {
  let tokensResponse;
  try {
    tokensResponse = await db
      .select({ accessToken: userTable.accessToken, refreshToken: userTable.refreshToken })
      .from(userTable)
      .where(eq(userTable.username, username))
      .limit(1)
      .execute();

    if (tokensResponse.length == 0) return null;
  } catch (error) {
    throw new Error((error as Error).message);
  }

  return tokensResponse[0];
}

export async function selectActiveUser(): Promise<User | null> {
  let activeUser;
  try {
    activeUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.isActive, 1))
      .limit(1)
      .execute();

    if (activeUser.length == 0) return null;
  } catch (error) {
    throw new Error((error as Error).message);
  }
  return activeUser[0];
}

export function isTokenExpired(expirationTime: number | string) {
  const currentTimestamp = Date.now();
  const expirationTimestamp = Number(expirationTime) * 1000;
  const expirationInHours = convertToHours(expirationTimestamp - currentTimestamp);

  if (expirationInHours <= 0) return true;

  return false;
}

function convertToHours(valueInMilliseconds: number) {
  return valueInMilliseconds / (1000 * 60 * 60);
}
