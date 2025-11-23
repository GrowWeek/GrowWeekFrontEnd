'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

      if (!token && !isAuthPage) {
        // 토큰이 없고 인증 페이지가 아니면 로그인으로 리다이렉트
        router.replace('/login');
      } else if (token && isAuthPage) {
        // 토큰이 있는데 로그인/회원가입 페이지면 메인으로 리다이렉트
        router.replace('/');
      }
      
      // 약간의 지연을 주어 리다이렉트 충돌 방지 및 자연스러운 전환
      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  // 초기 로딩 중에는 아무것도 보여주지 않거나 스피너 표시 (깜빡임 방지)
  if (isChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return <>{children}</>;
}

