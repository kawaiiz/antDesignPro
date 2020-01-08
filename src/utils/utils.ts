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

// 获取请求地址
export const getBaseUrl = (): string => {
  return process.env.NODE_ENV !== 'production' ? MyConfig.baseUrl.dev : MyConfig.baseUrl.pro
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