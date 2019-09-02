import axios from '@/utils/api.request';

export async function getRouteTree(): Promise<any>  {
  return axios.request({
    url: '/api/getRouteTree',
    method: 'POST',
  });
}