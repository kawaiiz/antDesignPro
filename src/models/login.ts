import { Reducer } from 'redux';
import { routerRedux } from 'dva/router';
import { Effect } from 'dva';
import { fakeAccountLogin, fakeMobileLogin, logout } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { getPageQuery, setToken, delToken } from '@/utils/utils';
import { formatMessage } from 'umi-plugin-react/locale';
import { notification } from 'antd';
import { reloadAuthorized } from '@/utils/Authorized'

import { MyConfig } from 'config'

const REFRESH_TOKEN = MyConfig.refreshToken


export interface StateType {
  status?: 1 | 0; // 是否登录
  type?: string; // 登录类型
}

export interface LoginModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    logout: Effect;
  };
  reducers: {
    changeLoginStatusReducers: Reducer<StateType>;
  };
}

const Model: LoginModelType = {
  namespace: 'login',

  state: {
    status: undefined,
  },
  effects: {
    *login({ payload }, { call, put }) {
      try {
        let res
        if (payload.type === "mobile") {
          res = yield call(fakeMobileLogin, payload);
        } else if (payload.type === "account") {
          res = yield call(fakeAccountLogin, payload);
        }
        yield put({
          type: 'changeLoginStatusReducers',
          payload: res,
        });
        // 设置用户身份 localstorage
        setAuthority(res.data.roles);
        // 设置 请求token和 刷新token
        setToken(`${res.data.accessToken.token_type} ${res.data.accessToken.access_token}`)
        setToken(`${res.data.accessToken.refresh_token}`, REFRESH_TOKEN)
        // 更新权限
        reloadAuthorized()
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params as { redirect: string };
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = redirect;
            return;
          }
        }
        yield put(routerRedux.replace(redirect || '/'));
      } catch (e) {
        notification.error({
          description: e.errorMsg,
          message: formatMessage({ id: 'component.error' }),
        });
        return Promise.reject(e)
      }
    },
    *logout(_, { call, put }) {
      const { redirect } = getPageQuery();
      // redirect
      if (window.location.pathname !== '/user/login' && !redirect) {
        yield call(logout)
        // 删除token
        delToken() 
        delToken(REFRESH_TOKEN)
        // 跳到登录页
        yield put(
          routerRedux.replace({
            pathname: '/user/login'
          })
        );
        // 清空state里的数据
        let res = {
          status: 0,
          data: {
            type: ''
          }
        }
        // 重置login的status
        yield put({
          type: 'changeLoginStatusReducers',
          payload: res,
        });
        // 清除上个人的数据
        yield put({
          type: 'user/saveCurrentUserReducers',
          payload: {},
        });
        // 清除 权限数组
        yield put({
          type: 'auth/setResourcesReducers',
          payload: { originalResourcesList: [], resourcesList: [], allResourcesList: [], resources: [] }
        });
      }
      // 设置用户身份 localstorage
      setAuthority('');
      // 更新权限
      reloadAuthorized()

    },
  },

  reducers: {
    changeLoginStatusReducers(state, { payload }) {
      return {
        ...state,
        status: payload.status,
        type: payload.data.type,
      };
    },
  },
};

export default Model;
