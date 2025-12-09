import React, { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-shell';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Terminal } from 'lucide-react';
import { VideoLoader } from '@/components/VideoLoader';
import { CustomTitlebar } from '@/components/CustomTitlebar';
import anyonLogo from '@/assets/logo-anyon.png';
import anyonTextLogo from '@/assets/ANYON.png';

const API_URL = 'http://localhost:4000';

export const LoginPage: React.FC = () => {
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Deep Link 이벤트 리스너 등록 (Tauri Deep Link 플러그인 v2)
    const setupListener = async () => {
      const unlisten = await listen<string[]>('plugin:deep-link://urls', async (event) => {
        console.log('Deep link received (plugin:deep-link://urls):', event.payload);

        try {
          // Tauri Deep Link 플러그인은 URL을 배열로 전달
          const urls = event.payload;
          if (urls && urls.length > 0) {
            const urlString = urls[0];
            const url = new URL(urlString);
            const token = url.searchParams.get('token');

            if (token) {
              setIsLoading(true);
              await login(token);
              console.log('Login successful!');
            } else {
              setError('로그인에 실패했습니다. 토큰이 없습니다.');
            }
          }
        } catch (error) {
          console.error('Login failed:', error);
          setError('로그인에 실패했습니다. 다시 시도해주세요.');
        } finally {
          setIsLoading(false);
        }
      });

      return unlisten;
    };

    const unlistenPromise = setupListener();

    return () => {
      unlistenPromise.then((fn) => fn());
    };
  }, [login]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 백엔드에서 구글 OAuth URL 가져오기 (Tauri HTTP 플러그인 사용)
      const response = await tauriFetch(`${API_URL}/auth/google/url`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get Google auth URL');
      }

      const data = await response.json();

      // 프로덕션 모드: OAuth URL로 리다이렉트
      const { url } = data as { url: string };
      if (url) {
        await open(url);
        console.log('Opened Google login page');
      }
    } catch (error) {
      console.error('Failed to open Google login:', error);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  const handleDevLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await tauriFetch(`${API_URL}/auth/dev/login`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Dev login failed');
      }

      const data = await response.json();
      if (data.token) {
        console.log('Dev Login successful!');
        await login(data.token);
      }
    } catch (error) {
      console.error('Dev login failed:', error);
      setError('Dev 로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex relative">
      {/* 타이틀바 - 전체 화면 위에 오버레이 */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <CustomTitlebar className="!bg-transparent !border-none !backdrop-blur-none" />
      </div>

      {/* 왼쪽: 브랜드 비주얼 영역 */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0a]" style={{ clipPath: 'inset(0)' }}>
        {/* 배경 장식 요소 */}
        <div className="absolute inset-0">
          {/* 중앙에서 바깥으로 퍼지는 흑백 그라데이션 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/15 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-white/20 rounded-full blur-[60px]" />
          
          {/* 그리드 패턴 */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* 브랜드 콘텐츠 */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <div className="space-y-8 max-w-md">
            {/* 로고 */}
            <div className="flex justify-center">
              <img 
                src={anyonLogo} 
                alt="ANYON" 
                className="h-32 invert"
              />
            </div>
            
            {/* 타이틀 */}
            <div className="space-y-6">
              <h1 className="text-5xl font-bold text-white/90 tracking-tight leading-tight">
                From idea to production.
              </h1>
              <p className="text-2xl text-white/60">
                No code required.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽: 로그인 폼 영역 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* 로고 */}
          <div className="text-center">
            <img src={anyonTextLogo} alt="ANYON" className="h-12 mx-auto" />
          </div>

          {/* 환영 메시지 */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              계정에 로그인하여 시작하세요
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* 로그인 버튼 */}
          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-3 text-base bg-card hover:bg-accent transition-all duration-200"
              size="lg"
            >
              {isLoading ? (
                <>
                  <VideoLoader size="sm" />
                  <span className="text-muted-foreground">로그인 중...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Google로 계속하기</span>
                </>
              )}
            </Button>

            {/* Dev Login Button (Development Only) */}
            {import.meta.env.DEV && (
              <Button
                onClick={handleDevLogin}
                disabled={isLoading}
                variant="ghost"
                className="w-full h-10 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                size="lg"
              >
                {isLoading ? (
                  <VideoLoader size="sm" />
                ) : (
                  <Terminal className="w-4 h-4" />
                )}
                Dev Login
              </Button>
            )}
          </div>

          {/* 구분선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
          </div>

          {/* 약관 */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            로그인하면{' '}
            <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">
              이용약관
            </a>
            과{' '}
            <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">
              개인정보처리방침
            </a>
            에 동의하는 것으로 간주됩니다.
          </p>

        </div>
      </div>
    </div>
  );
}