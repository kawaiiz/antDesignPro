import axios from '@/utils/api.request';
import { IRoute } from 'umi-types/config'

import { Method } from 'axios'

export async function setAuth(data: { data: IRoute[], method: Method }): Promise<any> {
  console.log(data)
  return await axios.request({
    url: '/api/setAuth',
    method: data.method,
    data: data.data
  });
}

export async function getRouteTree(): Promise<any> {
  return await axios.request({
    url: '/api/setAuth',
    method: 'get'
  });
}
