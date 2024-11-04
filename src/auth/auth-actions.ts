'use server';

import {
  decodeJwt,
  decodeProtectedHeader,
  importPKCS8,
  JWTHeaderParameters,
  jwtVerify,
  JWTVerifyOptions,
  KeyLike,
  SignJWT,
} from 'jose';
import { Session, sessionTable, User, userTable } from '../../drizzle/schema';
import { db } from '@/root/drizzle/client';
import { and, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

type JWTTokens = { accessToken: string; refreshToken: string };
type CreateProps = { sessionId: Session['sessionId'] };

export async function createJWTTokens({ sessionId }: CreateProps): Promise<JWTTokens> {
  if (!process.env.JWT_ACCESS_PRIVATE_SECRET || !process.env.JWT_REFRESH_PRIVATE_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    const kid = sessionId;
    const alg = 'RS256';

    const pkcs8Access = process.env.JWT_ACCESS_PRIVATE_SECRET;
    const accessTokenPrivateKey = await importPKCS8(pkcs8Access, alg);

    const pkcs8ARefresh = process.env.JWT_REFRESH_PRIVATE_SECRET;
    const refreshTokenPrivateKey = await importPKCS8(pkcs8ARefresh, alg);

    const claims = {
      protectedHeader: {
        alg: alg,
        typ: 'JWT',
        cty: 'JWT',
        kid: kid,
      } as JWTHeaderParameters,
      iss: 'Majstor Brana',
      iat: Math.floor(Date.now()),
    };

    const accessToken = await new SignJWT({ sessionId })
      .setProtectedHeader(claims.protectedHeader)
      .setIssuedAt(claims.iat)
      .setExpirationTime('10m')
      .setIssuer(claims.iss)
      .setAudience('Clients access token')
      .setSubject(sessionId)
      .sign(accessTokenPrivateKey);

    const refreshToken = await new SignJWT()
      .setProtectedHeader(claims.protectedHeader)
      .setIssuedAt(claims.iat)
      .setExpirationTime('72h')
      .setIssuer(claims.iss)
      .setAudience('Clients refresh token')
      .setSubject(sessionId)
      .sign(refreshTokenPrivateKey);

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new Error('Failed to generate JWT tokens');
  }
}

export async function decodeJWT(token: string) {
  try {
    const protectedHeader = decodeProtectedHeader(token);

    return protectedHeader;
  } catch (error) {
    console.log(error);
    return null;
  }
}

type VerifyJWT = {
  token: string;
  key: KeyLike | Uint8Array;
  options?: JWTVerifyOptions;
};
export async function verifyJWTSignature({ token, key, options }: VerifyJWT) {
  try {
    const verifiedPayload = await jwtVerify(token, key, {
      ...options,
      currentDate: new Date(0),
    });

    return verifiedPayload;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  if (accessToken) {
    cookies().set('accessToken', accessToken, {
      secure: false,
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
    });

    cookies().set('refreshToken', refreshToken, {
      secure: false,
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
    });
  }
}

type IssueTokenParams = {
  sessionId: Session['sessionId'];
};

export async function issueNewAccessToken({ sessionId }: IssueTokenParams) {
  try {
    const { accessToken } = await createJWTTokens({ sessionId });

    return accessToken;
  } catch (error) {
    console.error('Error issuing new access token:', error);
    throw new Error('Failed to issue new access token');
  }
}

type Params = {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  userId: string;
};

export async function createSession({ accessToken, refreshToken, sessionId, userId }: Params) {
  const now = new Date().toISOString();
  const decodedJWT = await decodeJwt(accessToken);
  const exp = decodedJWT.exp as number;

  try {
    await db
      .insert(sessionTable)
      .values({
        userId,
        accessToken,
        refreshToken,
        expiresAt: exp,
        sessionStart: now,
        sessionId,
      })
      .returning()
      .execute()
      .then((result) => result[0]);
  } catch (error) {
    console.log('Error Creating Session', error);
  }
}

export async function checkForTokenInDB(sessionId: string, accessToken: string) {
  try {
    const sessionRecord = await db
      .select()
      .from(sessionTable)
      .where(and(eq(sessionTable.sessionId, sessionId), eq(sessionTable.accessToken, accessToken)))
      .execute();

    if (!sessionRecord.length) return false;

    return true;
  } catch (error) {
    console.log(error);
  }
}
export async function isTokenExpired(expiration: number) {
  const isAccessTokenExpired = new Date(expiration) > new Date();

  if (isAccessTokenExpired) {
    return true;
  }

  return false;
}

export async function updateSessionWithToken(sessionId: string, accessToken: string) {
  try {
    const decodedJWT = await decodeJwt(accessToken);
    const exp = decodedJWT.exp as number;

    await db
      .update(sessionTable)
      .set({
        accessToken,
        expiresAt: exp,
      })
      .where(eq(sessionTable.sessionId, sessionId))
      .execute();
  } catch (error) {
    console.log(error);
  }
}

export async function clearJWTCookies() {
  cookies().delete('accessToken');
  cookies().delete('refreshToken');
}

type DeleteSessionProps = { sessionId: string };

export async function deleteSessionFromDB({ sessionId }: DeleteSessionProps) {
  try {
    const deletedToken = await db
      .delete(sessionTable)
      .where(eq(sessionTable.sessionId, sessionId))
      .returning();

    return deletedToken;
  } catch (error) {
    console.error('Error deleting session from db:', error);
    return null;
  }
}
