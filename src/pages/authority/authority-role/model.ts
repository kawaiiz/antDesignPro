import { AnyAction, Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';

export interface Role {
  id: number | string,
  name: string,
  role: []
}

export interface StateType {
  roleList: Role[]
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
    roleList: [],
  },

  effects: {

  },

  reducers: {

  },
};

export default Model;
