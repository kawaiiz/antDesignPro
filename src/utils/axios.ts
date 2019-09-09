import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import createAuthRefreshInterceptor from './axios-auth-refresh';
import router from 'umi/router';
import { getToken, delToken, setToken } from '@/utils/utils'
import { notification } from 'antd';
import { MyConfig } from '../../config/config'

const REFRESH_TOKEN = MyConfig.refreshToken

const baseUrl = process.env.NODE_ENV !== 'production' ? MyConfig.baseUrl.dev : MyConfig.baseUrl.pro

// 返回的信息格式
export interface Res {
  status: number,
  data?: object,
  message?: string,
  errorMsg?: string
}

// 设置请求类型
export enum SetMethod {
  add = 'put',
  edit = 'post',
  delete = 'delete',
  del = 'delete'
}

// axios 返回拦截器刷新token的函数
const refreshAuthLogic = (failedRequest: any) => axios({
  url: `${baseUrl}/api/public/web/refresh-token`,
  method: 'get',
  params: { refreshToken: getToken(REFRESH_TOKEN) }
}).then(tokenRefreshResponse => {
  setToken(tokenRefreshResponse.data);
  failedRequest.response.config.headers['Authentication'] = `${tokenRefreshResponse.data.token_type} ${tokenRefreshResponse.data}`;
  return Promise.resolve();
}).catch(err => {
  delToken(REFRESH_TOKEN)
  delToken()
  notification.error({
    description: '您的登录已失效，请重新登录',
    message: '登录失效',
  });
  router.push({
    pathname: 'login',
  });
})

// 处理错误请求的跳转
const errRouter = (errorInfo: Res) => {
  if (errorInfo.status === 404 || errorInfo.status === 500 || errorInfo.status === 403) {
    router.push({
      pathname: `/error-page/${errorInfo.status.toString()}`
    })
  } else {
    router.push({
      pathname: `/error-page/500`
    })
  }
}

// 初始化拦截器
// createAuthRefreshInterceptor(axios, refreshAuthLogic, {
//   statusCodes: [401, 403]
// });

// 请求封装成类
class HttpRequest {
  baseUrl: string
  queue: object
  constructor() {
    this.baseUrl = baseUrl
    this.queue = {}
  }

  // 一些全局配置 
  getInsideConfig() {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Access-Control-Allow-Origin': 'http://192.168.1.74:8000',
        'Authorization': getToken() || ''
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

    instance.interceptors.response.use((res: any) => res, (error: any) => {
      console.log(error)
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
      console.log(1)
      const statusCodes: number[] = [401, 403]
      if (!errorInfo || (errorInfo.status && statusCodes.indexOf(+errorInfo.status) === -1)) {
        errRouter(errorInfo)
        let errMsg = {
          msg: 'Page error'
        }
        return Promise.reject(errMsg)
      }

      console.log(2)

      const refreshCall = refreshAuthLogic(error);

      // Create interceptor that will bind all the others requests
      // until refreshTokenCall is resolved
      // const requestQueueInterceptorId = axios.interceptors
      //   .request
      //   .use(request => refreshCall.then(() => request));

      // When response code is 401 (Unauthorized), try to refresh the token.
      return refreshCall.then(() => {
        // axios.interceptors.request.eject(requestQueueInterceptorId);
        console.log(3)

        return axios(error.response.config);
      }).catch(error => {
        console.log(4)

        // axios.interceptors.request.eject(requestQueueInterceptorId);
        return Promise.reject(error)
      })
    })
  }

  // 照明胧
  request(options: AxiosRequestConfig) {
    // 创建一个axios实例
    const instance = axios.create()
    // config.headers['Content-Type'] =config.headers['Content-Type']?config.headers['Content-Type']:'application/json;charset=UTF-8'
    // 

    // 将默认配置与请求配置混合
    options = Object.assign(this.getInsideConfig(), options)
    console.log(options)
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
      if (statusCode.indexOf(res.data.status) !== -1 || !res.data.hasOwnProperty(status)) {
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
