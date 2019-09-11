import { AnyAction, Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';
import { fakeRegister } from './service';
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
    registerHandleReducers: Reducer<StateType>;
    initStateReducers: Reducer<StateType>
  };
}

const Model: ModelType = {
  namespace: 'userRegister',

  state: {
    status: undefined,
  },

  effects: {
    *submit({ payload }, { call, put }) {
      const response = yield call(fakeRegister, payload);
      yield put({
        type: 'registerHandleReducers',
        payload: response,
      });
    },
    initState({ payload }, { call, put }) {
      put({
        type: 'initStateReducers'
      });
    }
  },

  reducers: {
    registerHandleReducers(state, { payload }) {
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
