import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  decodeJWT,
  checkForTokenInDB,
  issueNewAccessToken,
  updateSessionWithToken,
  isTokenExpired,
  verifyJWTSignature,
  deleteSessionFromDB,
} from './auth/auth-actions';
import { importSPKI } from 'jose';

const spki = process.env.JWT_ACCESS_PUBLIC_SECRET;

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!accessToken || !refreshToken) {
    return redirectToSignIn(request);
  }

  try {
    const accessTokenKey = await importSPKI(spki as string, 'RS256');
    const verifiedJWT = await verifyJWTSignature({
      token: accessToken,
      key: accessTokenKey,
    });

    if (!verifiedJWT) {
      return await clearSessionAndRedirect({ accessToken, request });
    }

    const sessionId = verifiedJWT?.payload.sub as string;
    const expiration = verifiedJWT?.payload.exp as number;

    const isTokenInDB = await checkForTokenInDB(sessionId, accessToken);
    const isExpired = !isTokenExpired(expiration);

    if (isTokenInDB && isExpired) {
      return await renewAccessToken(sessionId);
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Error in middleware:', err);
    return redirectToSignIn(request);
  }
}

type ClearParams = {
  accessToken: string;
  request: NextRequest;
};

async function clearJWTCookies(response: NextResponse) {
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
}

export async function clearSessionAndRedirect({ accessToken, request }: ClearParams) {
  const decodedJWT = await decodeJWT(accessToken);
  const sessionId = decodedJWT?.kid as string;

  const response = NextResponse.redirect(new URL('/sign-in', request.url));

  await deleteSessionFromDB({ sessionId });
  await clearJWTCookies(response);

  return response;
}

async function renewAccessToken(sessionId: string) {
  const newAccessToken = await issueNewAccessToken({ sessionId });
  await updateSessionWithToken(sessionId, newAccessToken);

  const response = NextResponse.next();
  response.cookies.set('accessToken', newAccessToken, {
    secure: false,
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
  });

  return response;
}

function redirectToSignIn(request: NextRequest) {
  return NextResponse.redirect(new URL('/sign-in', request.url));
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
