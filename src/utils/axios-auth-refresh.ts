

/**
* Creates an authentication refresh interceptor that binds to any error response.
* If the response code is 401, interceptor tries to call the refreshTokenCall which must return a Promise.
* While refreshTokenCall is running, all new requests are intercepted and waiting for it to resolve.
* After Promise is resolved/rejected the authentication refresh interceptor is revoked.
* @param {AxiosInstance|Function} axios - axios instance
* @param {Function} refreshTokenCall - refresh token call which must return a Promise
* @param {Object} options - options for the interceptor @see defaultOptions
* @return {AxiosInstance}
*/

import router from 'umi/router';
import { AxiosStatic } from 'axios'
import { getToken, delToken, setToken } from '@/utils/utils'
import { MyConfig } from '../../config/config'
import { Res } from './axios'
const REFRESH_TOKEN = MyConfig.refreshToken

interface Option {
  statusCodes: number[]
}

/** @type {Object} */
const defaults: Option = {
  /** @type {Number[]} */
  statusCodes: [
    401 // Unauthorized
  ]
};

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


function createAuthRefreshInterceptor(axios: AxiosStatic, refreshTokenCall: (failedRequest: any) => Promise<void>, options: Option) {
  const id = axios.interceptors.response.use(res => res, error => {

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
    const statusCodes: number[] = options && options.hasOwnProperty('statusCodes') && options.statusCodes!.length
      ? options.statusCodes!
      : defaults.statusCodes;
    if (!errorInfo || (errorInfo.status && statusCodes.indexOf(+errorInfo.status) === -1)) {
      errRouter(errorInfo)
      let errMsg = {
        msg: 'Page error'
      }
      return Promise.reject(errMsg)
    }

    // Remove the interceptor to prevent a loop
    // in case token refresh also causes the 401
    axios.interceptors.response.eject(id);

    const refreshCall = refreshTokenCall(error);

    // Create interceptor that will bind all the others requests
    // until refreshTokenCall is resolved
    const requestQueueInterceptorId = axios.interceptors
      .request
      .use(request => refreshCall.then(() => request));

    // When response code is 401 (Unauthorized), try to refresh the token.
    return refreshCall.then(() => {
      axios.interceptors.request.eject(requestQueueInterceptorId);
      return axios(error.response.config);
    }).catch(error => {
      axios.interceptors.request.eject(requestQueueInterceptorId);
      return Promise.reject(error)
    }).finally(() => createAuthRefreshInterceptor(axios, refreshTokenCall, options));
  });
  return axios;
}
export default createAuthRefreshInterceptor;
