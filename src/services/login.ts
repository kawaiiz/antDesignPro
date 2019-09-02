import axios from '@/utils/api.request';

export interface LoginParamsType {
  userName: string;
  password: string;
  mobile: string;
  captcha: string;
}

export async function fakeAccountLogin(params: LoginParamsType): Promise<any>  {
  return axios.request({
    url: '/api/login/account',
    method: 'POST',
    data: params,
  });
}

interface mobile {
  mobile: string
}

export async function getFakeCaptcha(params: mobile): Promise<any>  {
  return axios.request({
    url: '/api/login/captcha',
    method: 'GET',
    params,
  });
}