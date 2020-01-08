import axios from '@/utils/api.request';

// 获取验证码
export async function getCaptcha(params: { mobile: string, type: string }): Promise<any> {
  return axios.request({
    url: '/api/public/web/sms',
    method: 'GET',
    params,
  });
}


// 以下列表的成员类型
export interface OtherListTag {
  code: number, // 编号
  descr: string, // 描述
  [key: string]: any
}


// 获取频道类型
export async function getChannelType(): Promise<any> {
  return axios.request({
    url: '/api/web/channel-type',
    method: 'GET',
  });
}

// 获取栏目类型
export async function getColumnType(): Promise<any> {
  return axios.request({
    url: '/api/web/column-type',
    method: 'GET',
  });
}

// 获取获取布局样式列表
export async function getLayoutType(): Promise<any> {
  return axios.request({
    url: '/api/web/layout-style',
    method: 'GET',

  });
}

// 获取认证的等级分类
export async function getAuthType(): Promise<any> {
  return axios.request({
    url: '/api/web/level',
    method: 'GET',

  });
}

// 获取链接的跳转方式
export async function getLinkType(): Promise<any> {
  return axios.request({
    url: '/api/web/link-jump-way',
    method: 'GET',
  });
}