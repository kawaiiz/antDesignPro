import axios from '@/utils/api.request';
import { UserRegisterParams } from './index';

export async function fakeRegister(params: UserRegisterParams) {
  return axios.request({
    url: '/api/register',
    method: 'POST',
    data: params,
  });
}