import axios from '@/utils/api.request';
import { Method } from 'axios'
import { Role } from './data.d'
import { AxiosRequestConfig } from 'axios'

export async function setRole({ data, method }: { data: Role, method: Method }): Promise<any> {
  const options: AxiosRequestConfig = {
    url: '/api/web/roles',
    method: method,
  }
  if (method == 'delete' || method == 'DELETE') options.params = data
  else if (method === 'post' || method === 'put' || method === 'POST' || method === 'PUT') options.data = data
  return await axios.request(options);
}

export async function getRoleDetail(data: { roleId: number }) {
  return await axios.request({
    url: '/api/web/roles/detail',
    method: 'get',
    params: data
  })
}