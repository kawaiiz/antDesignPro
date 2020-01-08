import axios from '@/utils/api.request';
import { Auth } from './data.d'
import { AxiosRequestConfig, Method } from 'axios'
import { setOptions } from '@/utils/utils'

export async function setAuth({ data, method }: { data: Auth | { pageIndex: number, pageSize: number }, method: Method }): Promise<any> {
  const options: AxiosRequestConfig = setOptions({
    url: '/api/web/html',
  }, data, method)
  return await axios.request(options);
}

export async function getAuthTree(): Promise<any> {
  return await axios.request({
    url: '/api/web/html/tree',
    method: 'GET',
  })
}

export async function getAuthDetail(data: { htmlId: number }): Promise<any> {
  return await axios.request({
    url: '/api/web/html/detail',
    method: 'GET',
    params: data
  })
}