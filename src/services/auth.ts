import axios from '@/utils/api.request';
import { IRoute } from 'umi-types/config'
import { AxiosRequestConfig, Method } from 'axios'
import { setOptions } from '@/utils/utils'

export async function setAuth({ data, method }: { data: IRoute[] | number | null, method: Method }): Promise<any> {
  const options: AxiosRequestConfig = setOptions({
    url: '/api/web/resources',
  }, data, method)
  
  return await axios.request(options);
}
