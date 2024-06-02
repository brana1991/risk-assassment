import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  decodeJWT,
  isTokenExpired,
  selectAccessTokensByUser,
  selectActiveUser,
} from './auth/helpers';
import { issueNewAccessToken, updateActiveUser } from './auth/server-actions';
import { importSPKI } from 'jose';

export async function middleware(request: NextRequest) {
  const activeUser = await selectActiveUser();

  if (!activeUser) return NextResponse.redirect(new URL('/sign-in', request.url));

  const accessTokens = await selectAccessTokensByUser({ username: activeUser.username });

  if (!accessTokens?.accessToken || !accessTokens.refreshToken)
    return NextResponse.redirect(new URL('/sign-in', request.url));

  try {
    const spki = process.env.JWT_ACCESS_PUBLIC_SECRET;
    const accessTokenPublicKey = await importSPKI(spki as string, 'RS256');

    const spkiRefresh = process.env.JWT_REFRESH_PUBLIC_SECRET;
    const accessTokenRefreshKey = await importSPKI(spkiRefresh as string, 'RS256');

    const accessTokenDecoded = await decodeJWT(accessTokens.accessToken, accessTokenPublicKey);

    const isAccessTokenInvalid =
      !accessTokenDecoded || isTokenExpired(accessTokenDecoded.payload.exp);

    if (isAccessTokenInvalid) {
      const newAccessToken = await issueNewAccessToken(
        accessTokens.refreshToken,
        accessTokenRefreshKey,
        activeUser,
      );

      if (!newAccessToken) {
        throw new Error('Failed to issue new access token');
      }

      const response = NextResponse.next();

      await updateActiveUser({
        accessToken: newAccessToken,
        refreshToken: accessTokens.refreshToken,
        user: activeUser,
      });

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
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
