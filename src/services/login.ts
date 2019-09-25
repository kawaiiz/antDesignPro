import axios from '@/utils/api.request';

export interface LoginParamsType {
  username: string;
  password: string;
  mobile: string;
  captcha: string;
}

// 用户名登录
export async function fakeAccountLogin(params: LoginParamsType): Promise<any> {
  return axios.request({
    url: '/api/public/web/login',
    method: 'POST',
    data: params,
  });
}

export async function fakeMobileLogin(params: LoginParamsType): Promise<any> {
  return axios.request({
    url: '/api/public/web/login-by-phone-number',
    method: 'POST',
    data: params,
  });
}
