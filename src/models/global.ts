import { Reducer } from 'redux';
import { Subscription, Effect } from 'dva';
import { NoticeIconData } from '@/components/NoticeIcon';
import { queryNotices } from '@/services/user';
import { ConnectState } from './connect.d';
import { formatMessage } from 'umi-plugin-react/locale';
import { notification } from 'antd';

export interface NoticeItem extends NoticeIconData {
  id: string;
  type: string;
  status: string;
}

export interface GlobalModelState {
  collapsed?: boolean;
  notices?: NoticeItem[];
}

export interface GlobalModelType {
  namespace: 'global';
  state: GlobalModelState;
  effects: {
    fetchAuth: Effect;
    fetchNotices: Effect;
    clearNotices: Effect;
    changeNoticeReadState: Effect;
  };
  reducers: {
    changeLayoutCollapsedReducers: Reducer<GlobalModelState>;
    saveNoticesReducers: Reducer<GlobalModelState>;
    saveClearedNoticesReducers: Reducer<GlobalModelState>;
  };
  subscriptions: { setup: Subscription };
}

const GlobalModel: GlobalModelType = {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
  },

  effects: {
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
    changeLayoutCollapsedReducers(state = { notices: [], collapsed: true }, { payload }): GlobalModelState {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNoticesReducers(state, { payload }): GlobalModelState {
      return {
        collapsed: false,
        ...state,
        notices: payload,
      };
    },
    saveClearedNoticesReducers(state = { notices: [], collapsed: true }, { payload }): GlobalModelState {
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
