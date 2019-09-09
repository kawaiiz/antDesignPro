import axios from '@/utils/api.request';

export async function query(): Promise<any> {
  return axios.request({
    url: '/api/users',
    method: 'GET',
  });
}

export async function queryCurrent(): Promise<any> {
  return axios.request({
    url: '/api/web/user',
    method: 'GET',
  });
}

export async function queryNotices(): Promise<any> {
  return axios.request({
    url: '/api/notices',
    method: 'GET',
  });
}



