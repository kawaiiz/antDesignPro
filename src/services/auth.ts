import axios from '@/utils/api.request';
import { IRoute } from 'umi-types/config'

import { SetMethod } from '@/utils/axios'

export async function setAuth({ data, method }: { data: IRoute[] | number | null, method: SetMethod }): Promise<any> {
  return await axios.request({
    url: '/api/web/resources',
    method: method,
    data: data,
    params: data
  });
}

