import { Reducer } from 'redux';
import { routerRedux } from 'dva/router';
import { Effect } from 'dva';
import { stringify } from 'querystring';

import { fakeAccountLogin, getFakeCaptcha } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { getPageQuery, setToken } from '@/utils/utils';

import { reloadAuthorized } from '@/utils/Authorized'

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
      const response = yield call(fakeAccountLogin, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });

      // Login successfully
      if (response.status === 1) {

        // 设置用户身份 localstorage
        setAuthority(response.data.currentAuthority);
        // 设置token cookie
        setToken(response.data.token)
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
      }
    },

    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },
    *logout(_, { put }) {
      const { redirect } = getPageQuery();



      // redirect
      if (window.location.pathname !== '/user/login' && !redirect) {
        yield put(
          routerRedux.replace({
            pathname: '/user/login'
          }),
        );
        // 清空state里的数据
        let response = {
          status: 0,
          data: {
            type: ''
          }
        }
        yield put({
          type: 'changeLoginStatus',
          payload: response,
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
