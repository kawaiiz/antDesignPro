
export interface Auth {
  id?: number,
  htmlId?: number,
  htmlAddr?: string,
  htmlName?: string,
  htmlType?: 'PAGE' | 'FUNC',
  iconUrl?: string,
  parentId?: number,
  resourceIds?: any[],
  resources?: any[],
  sortNum?: number,
  alias?: string,
  children?: Auth[],
  own?: Boolean
}