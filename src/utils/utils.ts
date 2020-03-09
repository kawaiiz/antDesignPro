import { parse } from 'querystring';

import { MyConfig } from 'config'


/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

// 获取当前页面的请求参数
export const getPageQuery = () => parse(window.location.href.split('?')[1]);

const TOKEN = MyConfig.token
const AUTO_LOGIN = MyConfig.autoLogin

export const setToken = (token: string, tokanName?: string): void => {
  const autoLogin = localStorage.getItem(AUTO_LOGIN)
  // 是否自动登录
  if (autoLogin === 'true') {
    localStorage.setItem(tokanName ? tokanName : TOKEN, token);
  }
  sessionStorage.setItem(tokanName ? tokanName : TOKEN, token)
}

export const getToken = (tokanName?: string): string => {
  const token = sessionStorage.getItem(tokanName ? tokanName : TOKEN);
  if (token) return token
  else return ''
}

export const delToken = (tokanName?: string) => {
  localStorage.removeItem(tokanName ? tokanName : TOKEN);
  sessionStorage.removeItem(tokanName ? tokanName : TOKEN);
}

/**
 * @description 判断当前环境是否是开发环境
 */
export const isDevelopment = () => {
  // production是生产环境
  return process.env.NODE_ENV !== 'production'
}

// 获取请求地址
export const getBaseUrl = (): string => {
  return isDevelopment() ? MyConfig.baseUrl.dev : MyConfig.baseUrl.pro
}

// 判断是否拥有某个资源的权限  传入参数是资源的id
import { IRoute } from 'umi-types/config'
export const getResourcesAuthById = (id: number | string): boolean => {
  const globalAuth: IRoute[] = JSON.parse(sessionStorage.getItem('globalAuth') || '[]')
  const _check = (globalAuth: IRoute[], id: number | string): boolean => {
    return globalAuth.some(item => {
      if (item.children && item.children.length > 0) {
        return _check(item.children, id) || item.htmlId == id && item.own
      } else {
        return item.htmlId == id && item.own
      }
    })
  }

  return _check(globalAuth, id)
}

// 判断当前请求的类型给请求对象附参数 仅用于 接口地址相同 请求类型不同的接口
import { Method, AxiosRequestConfig } from 'axios'
export const setOptions = (options: AxiosRequestConfig, data: any, method: Method) => {
  options.method = method
  if (method == 'delete' || method == 'DELETE' || method == 'get' || method == 'GET') options.params = data
  else if (method === 'post' || method === 'put' || method === 'POST' || method === 'PUT') options.data = data
  return options
}


// 用于modal 里effects 中的延时
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))


// 将扁平的一维数组 转成多维 
export const toTree = (arr: any[], pID: number) => {
  const ids = arr.map(a => a.id) // 获取所有的id
  const arrNotParent = arr.filter(
    ({ parentId }) => parentId && !ids.includes(parentId)// 返回所有父id存在 且 父id不存在与所有的资源id数组中  
  )
  const _ = (arr: any[], pID: string | number | null): any[] =>
    arr
      .filter(({ parentId }) => parentId == pID)
      .map(a => ({
        ...a,
        children: _(arr.filter(({ parentId }) => parentId != pID), a.id),
      }))
  // 这里 pID=0是因为后台设置一级页面的父id都是0
  return _(arr, pID).concat(arrNotParent)
}

/**
 * @param {Number} num 数值
 * @returns {String} 处理后的字符串
 * @description 如果传入的数值小于10，即位数只有1位，则在前面补充0
 */

export function getHandledValue(num: number) {
  return num < 10 ? "0" + num : num.toString();
} // 处理日期数据

/**
 * @param {Number} timeStamp 传入的时间戳
 * @param {Number} startType 要返回的时间字符串的格式类型，不传则返回年开头的完整时间
 */
export function getDate(data: Date | string | number, startType?: "yyyy-mm-dd" | "yyyy-mm-dd hh:mm:ss" | "yyyymmddhh hhmm" | "hh:mm") {
  // 传 时间或时间戳
  let d: Date
  if (typeof data === "object") {
    d = data
  } else {
    d = new Date(data);
  }
  let year = d.getFullYear();
  let month = getHandledValue(d.getMonth() + 1);
  let date = getHandledValue(d.getDate());
  let hours = getHandledValue(d.getHours());
  let minutes = getHandledValue(d.getMinutes());
  let second = getHandledValue(d.getSeconds());
  let resStr = "";
  if (startType === "yyyy-mm-dd") resStr = year + "-" + month + "-" + date; else if (startType === "yyyy-mm-dd hh:mm:ss") resStr = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + second; else if (startType === "yyyymmddhh hhmm") resStr = year + month + date + " " + hours + minutes; else if (startType === "hh:mm") resStr = hours + ":" + minutes; else resStr = month + "-" + date + " " + hours + ":" + minutes;
  return {
    time: resStr,
    year: year,
    month: month,
    date: date,
    hours: hours,
    minutes: minutes,
    second: second
  };
}
