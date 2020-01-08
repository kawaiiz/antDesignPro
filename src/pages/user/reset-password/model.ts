import { AnyAction, Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';
import { fakeResetPassword } from './service';
import { formatMessage } from 'umi-plugin-react/locale';
import { notification } from 'antd';

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
    resetPasswordHandleReducers: Reducer<StateType>;
    initStateReducers: Reducer<StateType>
  };
}

const Model: ModelType = {
  namespace: 'userResetPassword',

  state: {
    status: undefined,
  },

  effects: {
    *submit({ payload }, { call, put }) {
      try {
        const response = yield call(fakeResetPassword, payload);
        yield put({
          type: 'resetPasswordHandleReducers',
          payload: response,
        });
        return Promise.resolve()
      } catch (e) {
        return Promise.reject(e)
      }
    },
    initState({ payload }, { call, put }) {
      put({
        type: 'initStateReducers'
      });
    }
  },

  reducers: {
    resetPasswordHandleReducers(state, { payload }) {
      return {
        ...state,
        status: payload.status,
      };
    },
    initStateReducers(state) {
      const newState = { status: undefined }
      return {
        ...state, ...newState
      }
    }
  },
};

export default Model;
