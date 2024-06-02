import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJWT, issueNewAccessToken, updateTokens, validateToken } from './auth/auth-actions';
import { JWTPayload, JWTVerifyResult, importSPKI } from 'jose';
import { logoutUser, selectUserByUsername, updateUser } from './auth/user-actions';
const spki = process.env.JWT_ACCESS_PUBLIC_SECRET;

export async function middleware(request: NextRequest) {
  const accessTokenCookie = request.cookies.get('accessToken')?.value;
  const refreshTokenCookie = request.cookies.get('refreshToken')?.value;

  if (!accessTokenCookie || !refreshTokenCookie) {
    return redirectToSignIn(request);
  }

  try {
    const accessTokenPublicKey = await importSPKI(spki as string, 'RS256');
    const decoded = await decodeJWT(accessTokenCookie, accessTokenPublicKey);

    if ((decoded as { invalidToken: boolean })?.invalidToken) {
      return await handleInvalidToken(request);
    }

    if (!(decoded as JWTVerifyResult<JWTPayload>)?.payload?.sub) return null;
    const username = (decoded as JWTVerifyResult<JWTPayload>).payload.sub as string;

    const isValid = await validateToken(accessTokenCookie, refreshTokenCookie);

    if (!isValid) {
      const spkiRefresh = process.env.JWT_REFRESH_PUBLIC_SECRET;
      const refreshTokenPublicKey = await importSPKI(spkiRefresh as string, 'RS256');

      const newAccessToken = await issueNewAccessToken(
        refreshTokenCookie,
        refreshTokenPublicKey,
        username,
      );

      if (!newAccessToken) {
        return redirectToSignIn(request);
      }

      const user = await selectUserByUsername({ username });

      if (!user) {
        return redirectToSignIn(request);
      }

      const expiresAt = new Date(Date.now() + 5000).toISOString();
      await updateTokens(user.id, newAccessToken, refreshTokenCookie, expiresAt);

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

async function handleInvalidToken(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/sign-in', request.url));

  response.cookies.set('accessToken', '', {
    expires: new Date(0),
    path: '/',
  });

  response.cookies.set('refreshToken', '', {
    expires: new Date(0),
    path: '/',
  });

  await logoutUser({ isLoggedIn: 0 });
  return response;
}

function redirectToSignIn(request: NextRequest) {
  return NextResponse.redirect(new URL('/sign-in', request.url));
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
