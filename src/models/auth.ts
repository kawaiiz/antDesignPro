import { Reducer } from 'redux';
import { Effect } from 'dva';
import { getRouteTree, addAuth, editAuth, delAuth } from '@/services/auth';
import { formatMessage } from 'umi-plugin-react/locale';
import { IRoute } from 'umi-types/config'
import { notification } from 'antd';

export interface AuthModelState {
  authList?: IRoute[], // 多维权限数组
  originalAuthList?: IRoute[], // 一维权限数组
}

export interface AuthModelType {
  namespace: 'auth';
  state: AuthModelState;
  effects: {
    getAuthList: Effect;
    setAuth: Effect;
  };
  reducers: {
    setAuth: Reducer<AuthModelState>
  };
}

// 将扁平的一维数组 转成多维 
const toTree = (arr: IRoute[]) => {
  const ids = arr.map(a => a.id)
  const arrNotParent = arr.filter(
    ({ parentId }) => parentId && !ids.includes(parentId),
  )
  const _ = (arr: IRoute[], pID: string | number | null): IRoute[] =>
    arr
      .filter(({ parentId }) => parentId == pID)
      .map(a => ({
        ...a,
        children: _(arr.filter(({ parentId }) => parentId != pID), a.id),
      }))
  return _(arr, null).concat(arrNotParent)
}

const AuthModel: AuthModelType = {
  namespace: 'auth',
  state: {
    originalAuthList: [],// 一维的权限数组
    authList: [], // 权限数组
  },
  effects: {
    *getAuthList(_, { call, put }) {
      try {
        const res = yield call(getRouteTree) // 整体权限列表
        const authList = toTree(res.data)
        yield put({
          type: 'setAuth',
          payload: { originalAuthList: res.data, authList }
        })
        return Promise.resolve()
      } catch (e) {
        notification.error({
          description: e.message,
          message: formatMessage({ id: 'component.error' }),
        });
      }
    },
    *setAuth({ payload }, { call, put }) {
      try {
        const setAuthEventType = {
          add: addAuth,
          edit: editAuth,
          del: delAuth
        }
        const res = yield call(setAuthEventType[payload.type], payload.data) // 整体权限列表更新后返回全部的权限列表
        const authList = toTree(res.data)
        yield put({
          type: 'setAuth',
          payload: { originalAuthList: res.data, authList }
        })
        return Promise.resolve()
      } catch (e) {
        notification.error({
          description: e.message,
          message: formatMessage({ id: 'component.error' }),
        });
      }
    },

  },
  reducers: {
    setAuth(state, { payload }): AuthModelState {
      return {
        ...state,
        authList: payload.authList,
        originalAuthList: payload.originalAuthList,
      };
    },
  },
}

export default AuthModel;
