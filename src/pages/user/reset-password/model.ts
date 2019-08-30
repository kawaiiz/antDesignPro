import { AnyAction, Reducer } from 'redux';

import { EffectsCommandMap } from 'dva';
import { fakeResetPassword } from './service';

export interface StateType {
  status?: 'ok' | 'error';
  currentAuthority?: 'user' | 'guest' | 'admin';
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: StateType) => T) => T },
) => void;

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    submit: Effect;
    initState: Effect;
  };
  reducers: {
    resetPasswordHandle: Reducer<StateType>;
    initState: Reducer<StateType>
  };
}

const Model: ModelType = {
  namespace: 'userResetPassword',

  state: {
    status: undefined,
  },

  effects: {
    *submit({ payload }, { call, put }) {
      const response = yield call(fakeResetPassword, payload);
      yield put({
        type: 'resetPasswordHandle',
        payload: response,
      });
    },
    initState({ payload }, { call, put }) {
      put({
        type: 'initState'
      });
    }
  },

  reducers: {
    resetPasswordHandle(state, { payload }) {
      return {
        ...state,
        status: payload.status,
      };
    },
    initState(state) {
      const newState = { status: undefined }
      return {
        ...state, ...newState
      }
    }
  },
};

export default Model;
