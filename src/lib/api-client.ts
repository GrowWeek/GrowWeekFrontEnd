import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 요청 인터셉터
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 리다이렉트 헬퍼
const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken'); // 잔여 토큰 제거
    if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
      window.location.href = '/login';
    }
  }
};

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized 처리
    if (error.response?.status === 401) {
      
      // Refresh Token 갱신 요청 자체가 실패한 경우 -> 즉시 로그아웃
      if (originalRequest.url?.includes('/auth/refresh')) {
        redirectToLogin();
        return Promise.reject(error);
      }

      // 이미 재시도한 요청이거나, 재시도 플래그가 있는데 또 실패한 경우
      if (originalRequest._retry) {
        redirectToLogin();
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      
      try {
        // Refresh Token으로 갱신 시도
        await apiClient.post('/api/v1/auth/refresh');
        
        // 갱신 성공 후 원래 요청 재시도
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 갱신 실패 시 즉시 로그인 페이지로
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
