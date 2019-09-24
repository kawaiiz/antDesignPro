import { Reducer } from 'redux';
import { Subscription, Effect } from 'dva';
import { NoticeIconData } from '@/components/NoticeIcon';
import { queryNotices, query } from '@/services/user';
import { ConnectState } from './connect.d';
import { formatMessage } from 'umi-plugin-react/locale';
import { notification } from 'antd';

import { getCaptcha } from '@/services/globle'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export interface NoticeItem extends NoticeIconData {
  id: string;
  type: string;
  status: string;
}

export interface GlobalModelState {
  collapsed?: boolean; // 是否菜单折叠
  notices?: NoticeItem[];  // 新闻
  captchaTime?: number;// 请求短信的倒计时时间
  captchaDisable?: boolean; // 是否允许请求短信
}

export interface GlobalModelType {
  namespace: 'global';
  state: GlobalModelState;
  effects: {
    fetchAuth: Effect;
    fetchNotices: Effect;
    clearNotices: Effect;
    changeNoticeReadState: Effect;
    getCaptcha: Effect;
  };
  reducers: {
    changeLayoutCollapsedReducers: Reducer<GlobalModelState>;
    saveNoticesReducers: Reducer<GlobalModelState>;
    saveClearedNoticesReducers: Reducer<GlobalModelState>;
    setCaptchaTime: Reducer<GlobalModelState>;
    setCaptchaDisable: Reducer<GlobalModelState>;
  };
  subscriptions: { setup: Subscription };
}

const GlobalModel: GlobalModelType = {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
    captchaTime: 60,
    captchaDisable: false
  },

  effects: {
    *getCaptcha({ payload }, { call, select, put }) {
      try {
        yield call(getCaptcha, payload);
        yield put({
          type: 'setCaptchaDisable',
          payload: true
        })
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
              payload: 60
            })
            yield put({
              type: 'setCaptchaDisable',
              payload: false
            })
            break
          }
        }
      } catch (e) {
        console.log(e)
      }
    },
    // 可删
    *fetchAuth(_, { call, put, select }) {
      try {
        let data
        const res = yield call(queryNotices);
        data = res.data
        yield put({
          type: 'saveNoticesReducers',
          payload: data,
        });
        const unreadCount: number = yield select(
          (state: ConnectState) => state.global.notices.filter(item => !item.read).length,
        );
        yield put({
          type: 'user/changeNotifyCountReducers',
          payload: {
            totalCount: data.length,
            unreadCount,
          },
        });
      } catch (e) {
        notification.error({
          description: e.errorMsg,
          message: formatMessage({ id: 'component.error' }),
        });
      }
    },
    *fetchNotices(_, { call, put, select }) {
      try {
        let data
        const res = yield call(queryNotices);
        data = res.data
        yield put({
          type: 'saveNoticesReducers',
          payload: data,
        });
        const unreadCount: number = yield select(
          (state: ConnectState) => state.global.notices.filter(item => !item.read).length,
        );
        yield put({
          type: 'user/changeNotifyCountReducers',
          payload: {
            totalCount: data.length,
            unreadCount,
          },
        });
      } catch (e) {
        console.log(e)
      }
    },
    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNoticesReducers',
        payload,
      });
      const count: number = yield select((state: ConnectState) => state.global.notices.length);
      const unreadCount: number = yield select(
        (state: ConnectState) => state.global.notices.filter(item => !item.read).length,
      );
      yield put({
        type: 'user/changeNotifyCountReducers',
        payload: {
          totalCount: count,
          unreadCount,
        },
      });
    },
    *changeNoticeReadState({ payload }, { put, select }) {
      const notices: NoticeItem[] = yield select((state: ConnectState) =>
        state.global.notices.map(item => {
          const notice = { ...item };
          if (notice.id === payload) {
            notice.read = true;
          }
          return notice;
        }),
      );

      yield put({
        type: 'saveNoticesReducers',
        payload: notices,
      });

      yield put({
        type: 'user/changeNotifyCountReducers',
        payload: {
          totalCount: notices.length,
          unreadCount: notices.filter(item => !item.read).length,
        },
      });
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
      console.log(payload)
      return {
        ...state,
        captchaDisable: payload,
      };
    },
    changeLayoutCollapsedReducers(state = { notices: [], collapsed: true }, { payload }): GlobalModelState {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNoticesReducers(state, { payload }): GlobalModelState {
      return {
        ...state,
        collapsed: false,
        notices: payload,
      };
    },
    saveClearedNoticesReducers(state = { notices: [], collapsed: true }, { payload }): GlobalModelState {
      return {
        ...state,
        collapsed: false,
        notices: state.notices.filter((item): boolean => item.type !== payload),
      };
    },
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
