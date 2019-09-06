import { Reducer } from 'redux';
import { Effect } from 'dva';
import { getRouteTree, setAuth } from '@/services/auth';
import { formatMessage } from 'umi-plugin-react/locale';
import { IRoute } from 'umi-types/config'
import { notification } from 'antd';
import { SetMethod } from '@/utils/axios'

export interface AuthModelState {
  allAuthList: [], // 多维 页面+接口 权限数组
  authList?: IRoute[], // 多维 页面权限 数组
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
    setAuthList: Reducer<AuthModelState>
  };
}

// 将扁平的一维数组 转成多维 
export const toTree = (arr: IRoute[]) => {
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

// 筛出页面
const AuthModel: AuthModelType = {
  namespace: 'auth',
  state: {
    allAuthList: [], //  // 多维 页面+接口 权限数组
    authList: [], // 二维 页面权限 数组
    originalAuthList: [],// 一维的权限数组
  },
  effects: {
    *getAuthList(_, { call, put }) {
      try {
        const res = yield call(getRouteTree) // 整体权限列表
        const pageAuthList = res.data.filter(({ type }: { type: string }) => type && type === 'page')
        const authList = toTree(pageAuthList)
        const allAuthList = toTree(res.data)
        yield put({
          type: 'setAuthList',
          payload: { originalAuthList: res.data, authList, allAuthList }
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
        const res = yield call(setAuth, { data: payload.data, method: SetMethod[payload.type] }) // 整体权限列表更新后返回全部的权限列表
        const pageAuthList = res.data.filter(({ type }: { type: string }) => type && type === 'page')
        const authList = toTree(pageAuthList)
        const allAuthList = toTree(res.data)
        yield put({
          type: 'setAuthList',
          payload: { originalAuthList: res.data, authList, allAuthList }
        })
        return Promise.resolve()
      } catch (e) {
        console.log(e)
        notification.error({
          description: e.message,
          message: formatMessage({ id: 'component.error' }),
        });
      }
    },

  },
  reducers: {
    setAuthList(state, { payload }): AuthModelState {
      return {
        ...state,
        allAuthList: payload.allAuthList,
        authList: payload.authList,
        originalAuthList: payload.originalAuthList,
      };
    },
  },
}

export default AuthModel;
