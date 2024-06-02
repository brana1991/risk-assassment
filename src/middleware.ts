import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJWT, isTokenExpired, issueNewAccessToken } from './auth/auth-actions';
import { JWTPayload, JWTVerifyResult, importSPKI } from 'jose';
import { getTokensByUsername, updateActiveUser } from './auth/user-actions';
import { User } from '../drizzle/schema';
const spki = process.env.JWT_ACCESS_PUBLIC_SECRET;
const spkiRefresh = process.env.JWT_REFRESH_PUBLIC_SECRET;

export async function middleware(request: NextRequest) {
  const accessTokenCookie = request.cookies.get('accessToken')?.value;
  const refreshTokenCookie = request.cookies.get('refreshToken')?.value;

  if (!accessTokenCookie || !refreshTokenCookie) {
    return redirectToSignIn(request);
  }

  try {
    const { sub, exp } = await getDecodedTokenValues(accessTokenCookie);

    if (!exp || !sub) return redirectToSignIn(request);

    const loggedInUsername = sub;
    const isAccessTokenExpired = isTokenExpired(exp);

    const { match } = await compareDBTokensWithCookieTokens(
      sub,
      accessTokenCookie,
      refreshTokenCookie,
    );

    if (!match) return redirectToSignIn(request);

    if (isAccessTokenExpired) {
      const accessTokenRefreshKey = await importSPKI(spkiRefresh as string, 'RS256');

      const newAccessToken = await issueNewAccessToken(
        refreshTokenCookie,
        accessTokenRefreshKey,
        loggedInUsername,
      );

      await updateActiveUser({
        accessToken: newAccessToken,
        refreshToken: refreshTokenCookie,
        username: loggedInUsername,
      });

      const response = NextResponse.next();

      response.cookies.set('accessToken', newAccessToken, {
        secure: true,
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
      });

      return response;
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Error in middleware:', err);
    return redirectToSignIn(request);
  }
}

async function getDecodedTokenValues(accessTokenCookie: string): Promise<JWTPayload> {
  try {
    const accessTokenPublicKey = await importSPKI(spki as string, 'RS256');
    const results = await decodeJWT(accessTokenCookie, accessTokenPublicKey);

    return results.payload;
  } catch (error) {
    throw new Error('Failed to decideToken values');
  }
}

async function compareDBTokensWithCookieTokens(
  username: User['username'],
  accessTokenCookie: string,
  refreshTokenCookie: string,
): Promise<{ match: boolean }> {
  try {
    const tokensFromDb = await getTokensByUsername({ username });

    if (
      tokensFromDb &&
      tokensFromDb.accessToken === accessTokenCookie &&
      tokensFromDb.refreshToken === refreshTokenCookie
    ) {
      return { match: true };
    } else {
      return { match: false };
    }
  } catch (error) {
    throw new Error('Failed to fetch logged-in user.');
  }
}

function redirectToSignIn(request: NextRequest) {
  return NextResponse.redirect(new URL('/sign-in', request.url));
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
