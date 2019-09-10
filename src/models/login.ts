import { Reducer } from 'redux';
import { routerRedux } from 'dva/router';
import { Effect } from 'dva';
import { fakeAccountLogin, getFakeCaptcha } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { getPageQuery, setToken, delToken } from '@/utils/utils';

import { reloadAuthorized } from '@/utils/Authorized'

import { MyConfig } from '../../config/config'

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
    getCaptcha: Effect;
    logout: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
  };
}

const Model: LoginModelType = {
  namespace: 'login',

  state: {
    status: undefined,
  },
  effects: {
    *login({ payload }, { call, put }) {
      const res = yield call(fakeAccountLogin, payload);
      yield put({
        type: 'changeLoginStatus',
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
    },

    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },
    *logout(_, { put }) {
      const { redirect } = getPageQuery();
      // redirect
      if (window.location.pathname !== '/user/login' && !redirect) {
        // 跳到登录页
        yield put(
          routerRedux.replace({
            pathname: '/user/login'
          }),
        );
        // 清空state里的数据
        let res = {
          status: 0,
          data: {
            type: ''
          }
        }
        // 删除token
        delToken()
        delToken(REFRESH_TOKEN)
        // 重置login的status
        yield put({
          type: 'changeLoginStatus',
          payload: res,
        });
        // 清除上个人的数据
        yield put({
          type: 'user/saveCurrentUser',
          payload: {},
        });
      }

      // 设置用户身份 localstorage
      setAuthority('');
      // 设置token cookie
      setToken('')
      // 更新权限
      reloadAuthorized()

    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {

      return {
        ...state,
        status: payload.status,
        type: payload.data.type,
      };
    },
  },
};

export default Model;
