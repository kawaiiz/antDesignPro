import axios from '@/utils/api.request';
import { IRoute } from 'umi-types/config'
import { AxiosRequestConfig } from 'axios'
import { Method } from 'axios'


export async function setAuth({ data, method }: { data: IRoute[] | number | null, method: Method }): Promise<any> {
  const options: AxiosRequestConfig = {
    url: '/api/web/resources',
    method: method,
  }
  if (method == 'delete' || method == 'DELETE') options.params = data
  else if (method === 'post' || method === 'put' || method === 'POST' || method === 'PUT') options.data = data
  return await axios.request(options);
}

