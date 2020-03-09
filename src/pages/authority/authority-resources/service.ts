import axios from '@/utils/api.request';
import { ResourcesTag } from './data.d'
import { AxiosRequestConfig, Method } from 'axios'
import { setOptions } from '@/utils/utils'

export async function setResources({ data, method }: { data: ResourcesTag | { pageIndex: number, pageSize: number, resourceUrl: string }, method: Method }): Promise<any> {
  const options: AxiosRequestConfig = setOptions({
    url: '/api/web/resources',
  }, data, method)
  return await axios.request(options);
}


export async function getResourcesListAll() {
  return await axios.request({
    url: '/api/web/resources/search',
    method: 'GET',
  })
}