import { Effect } from 'dva';
import { Reducer } from 'redux';

import { queryCurrent, query as queryUsers } from '@/services/user';

import { setToken } from '@/utils/utils';
import { setAuthority } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized'


export interface CurrentUser {
  iconUrl?: string,
  id?: number,
  phoneNumber?: string,
  roles?: string[],
  username?: string
}

export interface UserModelState {
  currentUser?: CurrentUser;
  notifyCount?: number;
  unreadCount?: number;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetch: Effect;
    fetchCurrent: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
    changeNotifyCount: Reducer<UserModelState>;
    // saveAuth: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
    notifyCount: 0,
    unreadCount: 0
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const res: any = yield call(queryCurrent);
      const currentData: CurrentUser = res.data
      // 设置用户身份 localstorage
      setAuthority(currentData.roles![0]);
      // 更新权限
      reloadAuthorized()
      yield put({
        type: 'saveCurrentUser',
        payload: currentData,
      });
    },
  },

  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(
      state = {
        currentUser: {},
      },
      action,
    ) {
      return {
        ...state,
        notifyCount: action.payload.totalCount,
        unreadCount: action.payload.unreadCount,
      };
    },
  },
};

export default UserModel;
