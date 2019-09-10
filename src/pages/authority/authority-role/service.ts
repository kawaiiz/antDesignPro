import axios from '@/utils/api.request';
import { Method } from 'axios'

export async function setRole(data: { data: [], method: Method }): Promise<any> {
  return await axios.request({
    url: '/api/setRole',
    method: data.method,
    data: data.data
  });
}

export async function getRoleList(): Promise<any> {
  return await axios.request({
    url: '/api/web/roles',
    method: 'get'
  });
}
