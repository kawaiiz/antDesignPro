import { Reducer } from 'redux';
import { Effect } from 'dva';
import { setGlobalAuth, getGlobalAuthTree } from '@/services/auth';
import { IRoute } from 'umi-types/config'
import { formatMessage } from 'umi-plugin-react/locale';
import { notification } from 'antd';
import { SetMethod } from '@/utils/axios'
import lodash from 'lodash'
import { getAuthority } from '@/utils/authority';
import { Route } from '@ant-design/pro-layout/lib/typings'
import { Auth } from '@/pages/authority/authority-auth/data'

export interface AuthModelState {
  globalAuth?: Auth[], // 权限数组
  authRoutes?: (Route | IRoute)[],
  routes?: Route[] // 初始路由
}

export interface AuthModelType {
  namespace: 'auth';
  state: AuthModelState;
  effects: {
    getGlobalAuthTree: Effect;
    setGlobalAuth: Effect;
  };
  reducers: {
    setRoutesReducers: Reducer<AuthModelState>;
    setGlobalAuthReducers: Reducer<AuthModelState>;
  };
}
//       parentId: item.pid ? item.pid : null,
//       component: item.component,
//       hideInMenu: item.hideInMenu,
//       icon: item.icon || ' ',
//       id: item.id,
//       operation: item.operation,
//       own: item.own,
//       parentId: item.pid,
//       name: item.resourceName,
//       type: item.resourceType,
//       path: item.resourceUrl,
//       authority: item.own ? roles : [],

const createAuthRoute = (globalAuth: Auth[]): IRoute => {
  const roles = getAuthority()
  let authRoutes = []
  for (let i = 0; i < globalAuth.length; i++) {
    // 如果是生产环境就跳过这两个页面
    if (process.env.NODE_ENV === 'production' && (globalAuth[i].htmlId == 28 || globalAuth[i].htmlId === 29)) continue;

    if (globalAuth[i].htmlType === 'PAGE') {
      const newItem = {
        id: globalAuth[i].htmlId,
        path: globalAuth[i].htmlAddr,
        htmlName: globalAuth[i].htmlName,
        type: globalAuth[i].htmlType,
        icon: globalAuth[i].iconUrl || ' ',
        name: globalAuth[i].alias,
        children: globalAuth[i].children && globalAuth[i].children!.length > 0 ? createAuthRoute(globalAuth[i].children!) : [],
        hideInMenu: false,
        authority: globalAuth[i].own ? roles : [],
        // authority: true ? roles : [],
        own: globalAuth[i].own,
      }
      authRoutes.push(newItem)
    }
  }
  return authRoutes
}

// 筛出页面
const AuthModel: AuthModelType = {
  namespace: 'auth',
  state: {
    globalAuth: [], // 权限数组
    authRoutes: [],
    routes: []
  },
  effects: {
    *getGlobalAuthTree(_, { call, put }) {
      try {
        const res: { data: Auth[] } = yield call(getGlobalAuthTree, { data: null, method: SetMethod['get'] }) // 整体权限列表树
        sessionStorage.setItem('globalAuth', JSON.stringify(res.data))
        yield put({
          type: 'setGlobalAuthReducers',
          payload: { globalAuth: res.data, authRoutes: createAuthRoute(res.data) }
        })
        return Promise.resolve()
      } catch (e) {
        notification.error({
          description: e.errorMsg,
          message: formatMessage({ id: 'component.error' }),
        });
        return Promise.reject(e)
      }
    },
    *setGlobalAuth({ payload }, { call, put, select }) {
      try {
        const res: { data: Auth | number } = yield call(setGlobalAuth, { data: payload.data, method: SetMethod[payload.type] }) // 整体权限列表更新后返回全部的权限列表
        const oldGlobalAuth: Auth[] = lodash.cloneDeep(yield select((state: any) => state.auth.globalAuth))
        let newGlobalAuth: Auth[] = []
        if (payload.type === 'add') {
          oldGlobalAuth.push(res.data as Auth)
          newGlobalAuth = oldGlobalAuth
        } else if (payload.type === 'edit') {
          newGlobalAuth = oldGlobalAuth.map(item => {
            if (item.htmlId === (res.data as Auth).htmlId) {
              return Object.assign({}, item, res.data)
            }
            return item
          })
        } else if (payload.type === 'delete') {
          for (let i = 0; i < oldGlobalAuth.length; i++) {
            if (oldGlobalAuth[i].htmlId === res.data as number) {
              oldGlobalAuth.splice(i, 1)
              break
            }
          }
          newGlobalAuth = oldGlobalAuth
        }
        yield put({
          type: 'setGlobalAuthReducers',
          payload: { globalAuth: newGlobalAuth }
        })
        return Promise.resolve()
      } catch (e) {
        notification.error({
          description: e.errorMsg,
          message: formatMessage({ id: 'component.error' }),
        });
        return Promise.reject(e)
      }
    },
  },
  reducers: {
    setRoutesReducers(state, { payload }): AuthModelState {
      return {
        ...state,
        routes: payload
      };
    },
    setGlobalAuthReducers(state, { payload }): AuthModelState {
      return {
        ...state,
        ...payload
      };
    },
  },
}

export default AuthModel;
