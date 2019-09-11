import axios from '@/utils/api.request';
import { Method } from 'axios'
import { Person } from './data.d'
import { AxiosRequestConfig } from 'axios'

export async function setPerson({ data, method }: { data: Person | { pageIndex: number, pageSize: number }, method: Method }): Promise<any> {
  const options: AxiosRequestConfig = {
    url: '/api/web/manage-user',
    method: method,
  }
  if (method == 'delete' || method == 'DELETE') options.params = data
  else if (method === 'post' || method === 'put' || method === 'POST' || method === 'PUT') options.data = data
  return await axios.request(options);
}

export async function getPersonDetail(data: { userId: number }) {
  return await axios.request({
    url: '/api/web/manage-user/detail',
    method: 'get',
    params: data
  })
}