import axios from '@/utils/api.request';
import { AxiosRequestConfig } from 'axios'
import { Method } from 'axios'

export async function handleUserinfo({ data, method }: { data: { iconUrl: string, phoneNumber: string, [propName: string]: any }, method: Method }): Promise<any> {

  const options: AxiosRequestConfig = {
    url: '/api/web/user',
    method: method,
  }
  if (method == 'delete' || method == 'DELETE') options.params = data
  else if (method === 'post' || method === 'put' || method === 'POST' || method === 'PUT') options.data = data
  return await axios.request(options);
}



