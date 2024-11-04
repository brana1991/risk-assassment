'use client';

import { clearJWTCookies } from '@/auth/auth-actions';
import { logoutUser } from '@/auth/user-actions';
import { useRouter } from 'next/navigation';

export const LogoutButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await logoutUser();
        await clearJWTCookies();
        router.push('./');
      }}
    >
      Logout
    </button>
  );
};
