import { AnyAction, Reducer } from 'redux';

import { EffectsCommandMap } from 'dva';
import { getRouteTree } from './service';

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
  };
  reducers: {
  };
}


const Model: ModelType = {
  namespace: 'authorityTree',
  state: {
    status: undefined,
  },

  effects: {

  },

  reducers: {

  },
};

export default Model;
