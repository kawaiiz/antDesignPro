import axios from '@/utils/api.request';
import { Person } from './data.d'
import { AxiosRequestConfig, Method } from 'axios'
import { setOptions } from '@/utils/utils'

export async function setPerson({ data, method }: { data: Person | { pageIndex: number, pageSize: number }, method: Method }): Promise<any> {
  const options: AxiosRequestConfig = setOptions({
    url: '/api/web/manage-user',
  }, data, method)
  return await axios.request(options);
}