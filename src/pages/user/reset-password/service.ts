import axios from '@/utils/api.request';
import { UserResetPasswordParams } from './index';

export async function fakeResetPassword(params: UserResetPasswordParams): Promise<any>  {
  return axios.request({
    url: '/api/public/web/forget-password',
    method: 'POST',
    data: params,
  });
}