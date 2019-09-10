import { Reducer } from 'redux';
import { Effect } from 'dva';
import { setAuth } from '@/services/auth';
import { formatMessage } from 'umi-plugin-react/locale';
import { IRoute } from 'umi-types/config'
import { notification } from 'antd';
import { SetMethod } from '@/utils/axios'
import lodash from 'lodash'
import { getAuthority } from '@/utils/authority';
import { Route } from '@ant-design/pro-layout/lib/typings'
export interface AuthModelState {
  allAuthList?: [], // 多维 页面+接口 权限数组
  authList?: IRoute[], // 多维 页面权限 数组
  originalAuthList?: IRoute[], // 一维权限数组
  resources?: requestRoute[], // 后端发来的
  routes?: Route[] // 初始路由
}

export interface AuthModelType {
  namespace: 'auth';
  state: AuthModelState;
  effects: {
    getAuthList: Effect;
    setAuth: Effect;
  };
  reducers: {
    setAuthList: Reducer<AuthModelState>;
    setRoutes: Reducer<AuthModelState>;
  };
}

interface requestRoute {
  "id": number,
  "resourceName": string,
  "component": string,
  "icon": string,
  "resourceUrl": string,
  "operation": string,
  "resourceType": string,
  "pid": number,
  "own": boolean
}

// 将扁平的一维数组 转成多维 
export const toTree = (arr: IRoute[]) => {
  const ids = arr.map(a => a.id) // 获取所有的id
  const arrNotParent = arr.filter(
    ({ parentId }) => parentId && !ids.includes(parentId)// 返回所有父id存在 且 父id不存在与所有的资源id数组中  
  )
  const _ = (arr: IRoute[], pID: string | number | null): IRoute[] =>
    arr
      .filter(({ parentId }) => parentId == pID)
      .map(a => ({
        ...a,
        children: _(arr.filter(({ parentId }) => parentId != pID), a.id),
      }))
  // 这里 pID=0是因为后台设置一级页面的父id都是0
  return _(arr, 0).concat(arrNotParent)
}

const processingData = (resources: requestRoute[]) => {
  const roles = getAuthority()
  const IRouteFormatRes = resources.map(item => {
    return {
      // parentId: item.pid ? item.pid : null,
      parentId: item.pid,
      id: item.id,
      path: item.resourceUrl,
      name: item.resourceName,
      icon: item.icon,
      component: item.component,
      authority: item.own ? roles : [],
      type: item.resourceType,
      operation: item.operation
    }
  })
  const pageAuthList = IRouteFormatRes.filter(({ type }) => type && type === 'PAGE')
  const authList = toTree(pageAuthList)
  const allAuthList = toTree(IRouteFormatRes)
  console.log(1)
  return { originalAuthList: IRouteFormatRes, authList, allAuthList }
}

// 筛出页面
const AuthModel: AuthModelType = {
  namespace: 'auth',
  state: {
    allAuthList: [], //  // 多维 页面+接口 权限数组
    authList: [], // 二维 页面权限 数组
    originalAuthList: [],// 一维的权限数组 改了字段名的
    resources: [],// 后端发来的
    routes: []
  },
  effects: {
    *getAuthList(_, { call, put }) {
      try {
        const res: { data: requestRoute[] } = yield call(setAuth, { data: null, method: SetMethod['get'] }) // 整体权限列表
        const { originalAuthList, authList, allAuthList } = processingData(res.data)
        yield put({
          type: 'setAuthList',
          payload: { originalAuthList, authList, allAuthList, resources: res.data }
        })
        return Promise.resolve()
      } catch (e) {
        notification.error({
          description: e.message,
          message: formatMessage({ id: 'component.error' }),
        });
        return Promise.reject()
      }
    },
    *setAuth({ payload }, { call, put, select }) {
      try {
        const res: { data: requestRoute | number } = yield call(setAuth, { data: payload.data, method: SetMethod[payload.type] }) // 整体权限列表更新后返回全部的权限列表
        const oldResources: requestRoute[] = lodash.cloneDeep(yield select((state: any) => state.auth.resources))
        let newResoutces: requestRoute[] = []
        if (payload.type === 'add') {
          oldResources.push(res.data as requestRoute)
          newResoutces = oldResources
        } else if (payload.type === 'edit') {
          newResoutces = oldResources.map(item => {
            if (item.id === (res.data as requestRoute).id) {
              return Object.assign({}, item, res.data)
            }
            return item
          })
          console.log(newResoutces)
        } else if (payload.type === 'delete') {
          for (let i = 0; i < oldResources.length; i++) {
            console.log(oldResources[i].id, res.data)
            if (oldResources[i].id === res.data as number) {
              oldResources.splice(i, 1)
              break
            }
          }
          newResoutces = oldResources
        }
        const { originalAuthList, authList, allAuthList } = processingData(newResoutces)
        yield put({
          type: 'setAuthList',
          payload: { originalAuthList, authList, allAuthList, resources: newResoutces }
        })
        return Promise.resolve()
      } catch (e) {
        notification.error({
          description: e.message,
          message: formatMessage({ id: 'component.error' }),
        });
        return Promise.reject()
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
        resources: payload.resources
      };
    },
    setRoutes(state, { payload }): AuthModelState {
      return {
        ...state,
        routes: payload
      };
    }
  },
}

export default AuthModel;
