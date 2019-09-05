import axios from '@/utils/api.request';
import { IRoute } from 'umi-types/config'



export async function addAuth(data: { authList: IRoute[] }): Promise<any> {
  return await axios.request({
    url: '/api/setAuth',
    method: 'post',
    data
  });
}

export async function delAuth(data: { authList: IRoute[] }): Promise<any> {
  return await axios.request({
    url: '/api/setAuth',
    method: 'post',
    data
  });
}

export async function editAuth(data: { authList: IRoute[] }): Promise<any> {
  return await axios.request({
    url: '/api/setAuth',
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
