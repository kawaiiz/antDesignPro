import request from '@/utils/request';
import { UserResetPasswordParams } from './index';

export async function fakeResetPassword(params: UserResetPasswordParams) {
  return request('/api/resetPassword', {
    method: 'POST',
    data: params,
  });
}
