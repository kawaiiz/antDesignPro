import axios from '@/utils/api.request';

export async function getCaptcha(params: { mobile: string, type: string }): Promise<any> {
  return axios.request({
    url: '/api/public/web/sms',
    method: 'GET',
    params,
  });
}