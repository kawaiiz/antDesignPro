import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import router from 'umi/router';
import { getToken, delToken } from '@/utils/utils'
import { notification } from 'antd';
import { MyConfig } from '../../config/config'

const baseUrl = process.env.NODE_ENV !== 'production' ? MyConfig.baseUrl.dev : MyConfig.baseUrl.pro


const refreshAuthLogic = (failedRequest: any) => axios.post(`${baseUrl}/api/public/web/refresh-token`).then(tokenRefreshResponse => {
  localStorage.setItem('token', tokenRefreshResponse.data.token);
  failedRequest.response.config.headers['Authentication'] = 'Bearer ' + tokenRefreshResponse.data.token;
  return Promise.resolve();
}).catch(err => {
  notification.error({
    description: '您的登录已失效，请重新登录',
    message: '登录失效',
  });
  delToken()
  router.push({
    pathname: 'login',
  });
})
createAuthRefreshInterceptor(axios, refreshAuthLogic);

interface Res {
  status: number,
  data: object,
  message: string
}

export enum SetMethod {
  add = 'put',
  edit = 'post',
  delete = 'delete',
  del = 'delete'
}

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

class HttpRequest {
  baseUrl: string
  queue: object
  constructor() {
    this.baseUrl = baseUrl
    this.queue = {}
  }

  getInsideConfig() {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        //
      }
    }
    return config
  }


  interceptors(instance: any) {
    // 请求拦截
    instance.interceptors.request.use((config: AxiosRequestConfig) => {
      var token = getToken()

      // 设置请求头
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      config.headers['Access-Control-Allow-Origin'] = '*';
      config.headers['Authorization'] = token || '';
      /* if (!routerArr.includes(router.currentRoute.name)) {
           config.headers['Authorization'] = token
       }*/
      return config
    }, (error: any) => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use((res: Res) => {
      const { data, status } = res
      return { data, status }
    }, (error: any) => {
      let errorInfo = error.response
      if (!errorInfo) {
        const { request: { statusText, status }, config } = JSON.parse(JSON.stringify(error))
        errorInfo = {
          statusText,
          status,
          request: { responseURL: config.url }
        }
      }
      errRouter(errorInfo)

      let errMsg = {
        msg: 'Page error'
      }
      return Promise.reject(errMsg)
    })
  }

  // 照明胧
  request(options: AxiosRequestConfig) {
    const instance = axios.create()
    // config.headers['Content-Type'] =config.headers['Content-Type']?config.headers['Content-Type']:'application/json;charset=UTF-8'
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance)

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
      if (res.data.status === 1) {
        return Promise.resolve(res.data)
      } else if (res.data.status === 2) {
        notification.error({
          description: '您的登录已失效，请重新登录',
          message: '登录失效',
        });
        delToken()
        router.push({
          pathname: 'login',
        });
        return Promise.reject(res.data)
      } else {
        return Promise.reject(res.data)
      }
    }).catch((err: any) => {
      return Promise.reject(err)
    })
  }
}

export default HttpRequest
