import axios from '@/utils/api.request';
import { AxiosRequestConfig, Method } from 'axios'
import { setOptions } from '@/utils/utils'
import { Auth } from '@/pages/authority/authority-auth/data'

// 获取权限相关接口

export async function setGlobalAuth({ data, method }: { data: Auth[] | number | null, method: Method }): Promise<any> {
  const options: AxiosRequestConfig = setOptions({
    url: '/api/web/html',
  }, data, method)

  return await axios.request(options);
}

// 获取权限树
export async function getGlobalAuthTree(): Promise<any> {
  return axios.request({
    url: '/api/web/html/user',
    method: 'GET',
  });
}
