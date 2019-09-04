import { Reducer } from 'redux';
import { Subscription, Effect } from 'dva';
import { NoticeIconData } from '@/components/NoticeIcon';
import { queryNotices } from '@/services/user';
import { upDataAuthList, getRouteTree } from '@/services/globle';
import { ConnectState } from './connect.d';
import { formatMessage } from 'umi-plugin-react/locale';
import { IRoute } from 'umi-types/config'

import { notification } from 'antd';

export interface NoticeItem extends NoticeIconData {
  id: string;
  type: string;
  status: string;
}

export interface GlobalModelState {
  collapsed?: boolean;
  notices?: NoticeItem[];
  authList?: [] // 权限数组
  isAddauth?: boolean // 是否已经添加了权限数组
}

export interface GlobalModelType {
  namespace: 'global';
  state: GlobalModelState;
  effects: {
    fetchAuth: Effect;
    fetchNotices: Effect;
    clearNotices: Effect;
    changeNoticeReadState: Effect;
    getAuthList: Effect;
    upDataAuthList: Effect;
  };
  reducers: {
    setQueryAuth: Reducer<GlobalModelState>
    changeLayoutCollapsed: Reducer<GlobalModelState>;
    saveNotices: Reducer<GlobalModelState>;
    saveClearedNotices: Reducer<GlobalModelState>;
  };
  subscriptions: { setup: Subscription };
}

const GlobalModel: GlobalModelType = {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
    authList: []
  },

  effects: {
    *getAuthList(_, { call, put }) {
      try {
        let authList = yield call(getRouteTree) // 整体权限列表
        yield put({
          type: 'setQueryAuth',
          payload: authList.data
        })
        return Promise.resolve()
      } catch (e) {
        notification.error({
          description: e.message,
          message: formatMessage({ id: 'component.error' }),
        });
      }
    },
    *upDataAuthList({ payload }, { call, put }) {
      try {
        yield call(upDataAuthList, payload) // 整体权限列表
        yield put({
          type: 'setQueryAuth',
          payload: payload.authList
        })
        return Promise.resolve()
      } catch (e) {
        return Promise.reject(e)
      }
    },
    *fetchAuth(_, { call, put, select }) {
      try {
        let data
        const res = yield call(queryNotices);
        data = res.data
        yield put({
          type: 'saveNotices',
          payload: data,
        });
        const unreadCount: number = yield select(
          (state: ConnectState) => state.global.notices.filter(item => !item.read).length,
        );
        yield put({
          type: 'user/changeNotifyCount',
          payload: {
            totalCount: data.length,
            unreadCount,
          },
        });
      } catch (e) {
        notification.error({
          description: e.message,
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
          type: 'saveNotices',
          payload: data,
        });
        const unreadCount: number = yield select(
          (state: ConnectState) => state.global.notices.filter(item => !item.read).length,
        );
        yield put({
          type: 'user/changeNotifyCount',
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
        type: 'saveClearedNotices',
        payload,
      });
      const count: number = yield select((state: ConnectState) => state.global.notices.length);
      const unreadCount: number = yield select(
        (state: ConnectState) => state.global.notices.filter(item => !item.read).length,
      );
      yield put({
        type: 'user/changeNotifyCount',
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
        type: 'saveNotices',
        payload: notices,
      });

      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: notices.length,
          unreadCount: notices.filter(item => !item.read).length,
        },
      });
    },
  },

  reducers: {
    setQueryAuth(state, { payload }): GlobalModelState {
      return {
        ...state,
        authList: payload,
      };
    },
    changeLayoutCollapsed(state = { notices: [], collapsed: true }, { payload }): GlobalModelState {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }): GlobalModelState {
      return {
        collapsed: false,
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state = { notices: [], collapsed: true }, { payload }): GlobalModelState {
      return {
        collapsed: false,
        ...state,
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
