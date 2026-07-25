import { useEffect, useCallback } from 'react';

const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

/**
 * Load Facebook JS SDK một lần duy nhất và khởi tạo.
 * Trả về hàm `loginWithFacebook()` để trigger popup.
 */
export function useFacebookSDK() {
  useEffect(() => {
    // Tránh load 2 lần nếu đã có
    if (document.getElementById('facebook-jssdk')) return;

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FB_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v19.0',
      });
    };

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/vi_VN/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  /**
   * Mở popup Facebook Login.
   * @returns {Promise<string>} accessToken
   */
  const loginWithFacebook = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error('Facebook SDK chưa sẵn sàng. Vui lòng thử lại.'));
        return;
      }
      window.FB.login(
        (response) => {
          if (response.authResponse?.accessToken) {
            resolve(response.authResponse.accessToken);
          } else {
            reject(new Error('Người dùng đã huỷ đăng nhập Facebook.'));
          }
        },
        { scope: 'public_profile,email' }
      );
    });
  }, []);

  return { loginWithFacebook };
}
