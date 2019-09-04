import axios from '@/utils/api.request';
import { IRoute } from 'umi-types/config'

export async function upDataAuthList(data: { authList: IRoute[] }): Promise<any> {
  return await axios.request({
    url: '/api/upDataAuthList',
    method: 'post',
    data
  });
}

export async function getRouteTree(): Promise<any> {
  return await axios.request({
    url: '/api/getRouteTree',
    method: 'post'
  });
}
