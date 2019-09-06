import { Reducer } from 'redux';
import { Effect } from 'dva';
import { getRoleList, setRole } from './service';
import { formatMessage } from 'umi-plugin-react/locale';

import { notification } from 'antd';

import { SetMethod } from '@/utils/axios'

import { Role } from './data.d'

export interface RoleModelState {
  roleList: Role[] // 系统角色
}

export interface ModelType {
  namespace: 'role';
  state: RoleModelState;
  effects: {
    getRoleList: Effect;
    setRole: Effect;
  };
  reducers: {
    setRoleList: Reducer<RoleModelState>
  };
}


const Model: ModelType = {
  namespace: 'role',
  state: {
    roleList: [],
  },
  effects: {
    *getRoleList(_, { call, put }) {
      try {
        const res = yield call(getRoleList) // 整体权限列表
        yield put({
          type: 'setRoleList',
          payload: { roleList: res.data }
        })
        return Promise.resolve()
      } catch (e) {
        notification.error({
          description: e.message,
          message: formatMessage({ id: 'component.error' }),
        });
      }
    },
    *setRole({ payload }, { call, put }) {
      try {
        const res = yield call(setRole, { data: payload.data, method: SetMethod[payload.type] }) // 整体角色列表更新后返回全部的角色列表
        yield put({
          type: 'setRoleList',
          payload: { roleList: res.data }
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
    setRoleList(state, { payload }): RoleModelState {
      return {
        ...state,
        roleList: payload.roleList,
      };
    },
  },
};

export default Model;
