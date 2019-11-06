import axios from '@/utils/api.request';
import { Role } from './data.d'
import { AxiosRequestConfig, Method } from 'axios'
import { setOptions } from '@/utils/utils'

export async function setRole({ data, method }: { data: Role, method: Method }): Promise<any> {
  const options: AxiosRequestConfig = setOptions({
    url: '/api/web/roles',
  }, data, method)
 
  return await axios.request(options);
}

export async function getRoleDetail(data: { roleId: number }) {
  return await axios.request({
    url: '/api/web/roles/detail',
    method: 'GET',
    params: data
  })
}