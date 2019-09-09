import { parse } from 'querystring';
import Cookies from 'js-cookie'
/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignPro = (): boolean => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }
  return window.location.hostname === 'preview.pro.ant.design';
};

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'development') {
    return true;
  }
  return isAntDesignPro();
};

export const getPageQuery = () => parse(window.location.href.split('?')[1]);


import { MyConfig } from '../../config/config'

export const TOKEN_KEY = MyConfig.token

export const setToken = (token: string, tokanName?: string): void => {
  localStorage.setItem(tokanName ? tokanName : TOKEN_KEY, token);
  Cookies.set(TOKEN_KEY, token, { expires: MyConfig.cookieExpires || 1 })
}

export const getToken = (tokanName?: string): string => {
  // const token = Cookies.get(TOKEN_KEY)
  const token = localStorage.getItem(tokanName ? tokanName : TOKEN_KEY);
  if (token) return token
  else return ''
}

export const delToken = (tokanName?: string) => {
  // Cookies.remove(tokanName ? tokanName : TOKEN_KEY);
  localStorage.removeItem(tokanName ? tokanName : TOKEN_KEY);
}

