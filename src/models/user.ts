import { Effect } from 'dva';
import { Reducer } from 'redux';
import { routerRedux } from 'dva/router';

import { handleUserinfo, handlePassword } from '@/services/user';
import { setAuthority } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized'
import { SetMethod } from '@/utils/axios'
import { formatMessage } from 'umi-plugin-react/locale';
import { notification } from 'antd';


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
    changePassword: Effect;
    fetchCurrent: Effect;
    changeCurrent: Effect;
  };
  reducers: {
    saveCurrentUserReducers: Reducer<UserModelState>;
    changeNotifyCountReducers: Reducer<UserModelState>;
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
    // 修改密码
    *changePassword({ payload }, { call, put }) {
      try {
        const res: any = yield call(handlePassword, { data: payload });
        return Promise.resolve(res.data)
      } catch (e) {
        console.log(e)
        return Promise.reject(e)
      }
    },
    // 用户修改自己的信息  这里不涉及到权限修改 所以只调用put
    *changeCurrent({ payload }, { call, put }) {
      try {
        const res: any = yield call(handleUserinfo, { data: payload, method: SetMethod['edit'] });
        yield put({
          type: 'saveCurrentUserReducers',
          payload: res.data,
        });
        return Promise.resolve(res.data)
      } catch (e) {
        console.log(e)
        return Promise.reject(e)
      }
    },
    // 获取用户信息
    *fetchCurrent(_, { call, put }) {
      try {
        const res: any = yield call(handleUserinfo, { data: null, method: SetMethod['get'] });
        const currentData: CurrentUser = res.data
        // 设置用户身份 localstorage
        setAuthority(currentData.roles!);
        // 更新权限
        reloadAuthorized()
        yield put({
          type: 'saveCurrentUserReducers',
          payload: currentData,
        });
      } catch (e) {
        routerRedux.replace({
          pathname: '/user/login'
        })
      }
    },
  },

  reducers: {
    saveCurrentUserReducers(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCountReducers(
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
