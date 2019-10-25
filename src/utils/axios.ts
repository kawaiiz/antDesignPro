import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import router from 'umi/router';
import { getToken, delToken, setToken, getBaseUrl } from '@/utils/utils'
import { notification } from 'antd';
import { MyConfig } from 'config'

const REFRESH_TOKEN = MyConfig.refreshToken

// 返回的信息格式
export interface Res {
  status: number,
  data?: object,
  message?: string,
  errorMsg?: string
}

// 设置请求类型
export enum SetMethod {
  get = 'get',
  add = 'POST',
  edit = 'put',
  delete = 'delete',
  del = 'delete'
}

// 为防止同时多个请求进入
// 是否正在刷新的标记 
let isRefreshing = false
// 重试队列，每一项将是一个待执行的函数形式
let requests: any[] = [] // 请求数组


// axios 返回拦截器刷新token的函数
const refreshAuthLogic = (failedRequest: any) => axios({
  url: `${getBaseUrl()}/api/public/web/refresh-token`,
  method: 'get',
  params: { refreshToken: getToken(REFRESH_TOKEN) }
}).then(tokenRefreshResponse => {
  if (tokenRefreshResponse.data.status === 1007) {
    return Promise.reject(tokenRefreshResponse.data);
  }
  setToken(`${tokenRefreshResponse.data.data.token_type} ${tokenRefreshResponse.data.data.access_token}`);
  setToken(tokenRefreshResponse.data.data.refresh_token, REFRESH_TOKEN);
  failedRequest.response.config.headers['Authorization'] = `${tokenRefreshResponse.data.data.token_type} ${tokenRefreshResponse.data.data.access_token}`;
  return Promise.resolve(`${tokenRefreshResponse.data.data.token_type} ${tokenRefreshResponse.data.data.access_token}`);
}).catch(err => {
  delToken(REFRESH_TOKEN)
  delToken()
  notification.error({
    description: '您的登录已失效，请重新登录',
    message: '登录失效',
  });
  router.push({
    pathname: '/user/login',
  });
  return Promise.reject(err);
})

// 处理错误请求的跳转
const errRouter = (errorInfo: Res) => {
  if (errorInfo.status === 404 || errorInfo.status === 500) {
    router.push({
      pathname: `/error-page/${errorInfo.status.toString()}`
    })
  } /* else {
    router.push({
      pathname: `/error-page/500`
    })
  } */
}

// 请求封装成类
class HttpRequest {
  baseUrl: string
  queue: object
  constructor() {
    this.baseUrl = getBaseUrl()
    this.queue = {}
  }

  // 一些全局配置 
  getInsideConfig() {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        // 'X-Requested-With': 'XMLHttpRequest',
        // 'Access-Control-Allow-Origin': 'http://192.168.1.74:8000',
        'Authorization': getToken() || '',
        'Content-Type': 'application/json;charset=UTF-8'
      }
    }
    return config
  }

  // 添加拦截器 （本来这里添加了rep拦截器和res拦截器，因为刷新token需要用到拦截器所以就不子啊这里设置req拦截器）
  interceptors(instance: any) {
    // 请求拦截
    instance.interceptors.request.use((config: AxiosRequestConfig) => {
      return config
    }, (error: any) => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use((res: any) => res, (error: any) => {
      let errorInfo = error.response
      if (!errorInfo) {
        const { request: { statusText, status }, config } = JSON.parse(JSON.stringify(error))
        errorInfo = {
          statusText,
          status,
          request: { responseURL: config.url }
        }
      }
      // Reject promise if the error status is not in options.ports or defaults.ports
      const refreshStatusCodes: number[] = [401]
      // 判断是不是特殊错误 没有返回信息  或 不是401 的进
      if (!errorInfo || (errorInfo.status && refreshStatusCodes.indexOf(errorInfo.status) === -1)) {
        errRouter(errorInfo)
        let errMsg = errorInfo.data || {
          errorMsg: 'Page Error'
        }
        return Promise.reject(errMsg)
      }
      if (!isRefreshing) {
        isRefreshing = true
        const refreshCall = refreshAuthLogic(error);
        // Create interceptor that will bind all the others requests
        // until refreshTokenCall is resolved
        // const requestQueueInterceptorId = axios.interceptors
        //   .request
        //   .use(request => refreshCall.then(() => request));
        // When response code is 401 (Unauthorized), try to refresh the token.
        return refreshCall.then((token) => {
          // axios.interceptors.request.eject(requestQueueInterceptorId);
          requests.forEach(cb => cb(token))
          // 重试完了别忘了清空这个队列（掘金评论区同学指点）
          requests = []
          return instance(error.response.config);
        }).catch(error => {
          // axios.interceptors.request.eject(requestQueueInterceptorId);
          return Promise.reject(error)
        }).finally(() => {
          isRefreshing = false
        })
      } else {
        return new Promise((resolve) => {
          // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
          requests.push((token: string) => {
            error.response.config.headers['Authorization'] = token;
            resolve(instance(error.response.config))
          })
        })
      }
    })
  }

  // 照明胧
  request(options: AxiosRequestConfig) {
    // 创建一个axios实例
    const instance = axios.create()
    // 将默认配置与请求配置混合
    options = Object.assign(this.getInsideConfig(), options)
    // 添加拦截器
    this.interceptors(instance)

    // 根据请求类型转换请求参数
    if (options.headers['Content-Type'] === 'application/x-www-form-urlencoded; charset=UTF-8') {
      options.transformRequest = [function (data: object): FormData {
        let params = new FormData;
        for (let i in data) {
          params.append(i, data[i]);
        }
        return params;
      }]
    }

    return instance(options).then((res: AxiosResponse) => {
      const statusCode = [200]
      if (statusCode.indexOf(res.data.status) !== -1 || !res.data.hasOwnProperty('status')) {
        return Promise.resolve(res.data)
      } else {
        return Promise.reject(res.data)
      }
    }).catch((err: any) => {
      return Promise.reject(err)
    })
  }
}

export default HttpRequest
