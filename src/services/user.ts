import axios from '@/utils/api.request';
import { AxiosRequestConfig } from 'axios'
import { Method } from 'axios'
import { setOptions } from '@/utils/utils'


interface handleUserinfoInterface {
  data: { iconUrl: string, phoneNumber: string, [propName: string]: any }, method: Method
}
// 关于个人信息的增删改查
export async function handleUserinfo({ data, method }: handleUserinfoInterface): Promise<any> {
  const options: AxiosRequestConfig =  setOptions({
    url: '/api/web/user',
  }, data, method)
  return await axios.request(options);
}

interface handlePasswordInterface {
  "confirmPassword": string,
  "newPassword": string,
  "oldPassword"?: string,
  "phoneNumber"?: string,
  "captcha"?: string,
}
export async function handlePassword(params: handlePasswordInterface) {
  return axios.request({
    url: '/api/web/user/password',
    method: 'POST',
    data: params,
  });
}


