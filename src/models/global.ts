import { Reducer } from 'redux';
import { Subscription, Effect } from 'dva';
import { ConnectState } from './connect.d';
import { formatMessage } from 'umi-plugin-react/locale';
import { notification } from 'antd';

import { getCaptcha, getLayoutType, getColumnType, getLinkType, getChannelType, getAuthType } from '@/services/globle'
import { delay } from '@/utils/utils'
// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))


export interface GlobalModelState {
  collapsed?: boolean; // 是否菜单折叠
  captchaTime?: number;// 请求短信的倒计时时间
  captchaDisable?: boolean; // 是否允许请求短信
  layoutTypeList?: any[],// 布局类型列表
  columnTypeList?: any[],// 栏目类型列表
  channelTypeList?: any[],// 频道类型列表
  jumpWayList?: any[],// 跳转方式列表
  authTypeList?: any[],// 鉴权方式列表
}

export interface GlobalModelType {
  namespace: 'global';
  state: GlobalModelState;
  effects: {
    getCaptcha: Effect;
    setBtnTime: Effect;
    getLayoutType: Effect;
    getColumnType: Effect;
    getChannelType: Effect;
    getJumpWayList: Effect;
    getAuthTypeList: Effect;
  };
  reducers: {
    changeLayoutCollapsedReducers: Reducer<GlobalModelState>;
    setCaptchaTime: Reducer<GlobalModelState>;
    setCaptchaDisable: Reducer<GlobalModelState>;
    setStateAttrReducers: Reducer<GlobalModelState>;
  };
  subscriptions: { setup: Subscription };
}

const GlobalModel: GlobalModelType = {
  namespace: 'global',

  state: {
    collapsed: false,
    captchaTime: 5,
    captchaDisable: false,
    layoutTypeList: [],
    columnTypeList: [],
    channelTypeList: [],
    jumpWayList: [],
    authTypeList: [],
  },

  effects: {
    *getCaptcha({ payload }, { call, put }) {
      try {
        yield call(getCaptcha, payload);
        yield put({
          type: 'setCaptchaDisable',
          payload: true
        })
        return Promise.resolve()
      } catch (e) {
        return Promise.reject(e)
      }
    },
    *setBtnTime(_, { call, put, select }) {
      while (true) {
        const time: number = yield select(
          (state: ConnectState) => state.global.captchaTime
        );
        yield call(delay, 1000); // 延时1之后进行下一次的while循环执行
        if (time > 0) {
          yield put({
            type: 'setCaptchaTime',
            payload: time - 1
          })
        } else {
          yield put({
            type: 'setCaptchaTime',
            payload: 5
          })
          yield put({
            type: 'setCaptchaDisable',
            payload: false
          })
          break
        }
      }
    },
    *getLayoutType(_, { call, put }) {
      try {
        const res = yield call(getLayoutType)
        yield put({ type: 'setStateAttrReducers', payload: { layoutTypeList: res.data } })
        return Promise.resolve(res.data)
      } catch (e) {
        return Promise.reject(e)
      }
    },
    *getColumnType(_, { call, put }) {
      try {
        const res = yield call(getColumnType)
        yield put({ type: 'setStateAttrReducers', payload: { columnTypeList: res.data } })
        return Promise.resolve(res.data)
      } catch (e) {
        return Promise.reject(e)
      }
    },
    *getChannelType(_, { call, put }) {
      try {
        const res = yield call(getChannelType)
        yield put({ type: 'setStateAttrReducers', payload: { channelTypeList: res.data } })
        return Promise.resolve(res.data)
      } catch (e) {
        return Promise.reject(e)
      }
    },
    *getJumpWayList(_, { call, put }) {
      try {
        const res = yield call(getLinkType)
        yield put({ type: 'setStateAttrReducers', payload: { jumpWayList: res.data } })
        return Promise.resolve(res.data)
      } catch (e) {
        return Promise.reject(e)
      }
    },
    *getAuthTypeList(_, { call, put }) {
      try {
        const res = yield call(getAuthType)
        yield put({ type: 'setStateAttrReducers', payload: { authTypeList: res.data } })
        return Promise.resolve(res.data)
      } catch (e) {
        return Promise.reject(e)
      }
    },
  },
  reducers: {
    setCaptchaTime(state, { payload }): GlobalModelState {
      return {
        ...state,
        captchaTime: payload,
      };
    },
    setCaptchaDisable(state, { payload }): GlobalModelState {
      return {
        ...state,
        captchaDisable: payload,
      };
    },
    changeLayoutCollapsedReducers(state = { collapsed: true }, { payload }): GlobalModelState {
      return {
        ...state,
        collapsed: payload,
      };
    },
    // 要求修改的字段名要与赋值的相同
    setStateAttrReducers(state, { payload }) {
      return Object.assign({}, state, payload)
    }
  },

  subscriptions: {
    setup({ history }): void {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      history.listen(({ pathname, search }): void => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};

export default GlobalModel;
