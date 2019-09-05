import React, { Component } from 'react'
import { connect } from 'dva';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import lodash from 'lodash'
import { notification } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {
  Card,
  Empty,
  Alert,
  Drawer,
  Button,
} from 'antd';

import { StateType } from './model'
import RoleTable from './components/table'

@connect(
  ({
    listBasicList,
    loading,
  }: {
    listBasicList: StateType;
    loading: {
      models: { [key: string]: boolean };
    };
  }) => ({
    listBasicList,
    loading: loading.models.listBasicList,
  }),
)
class AuthorityRole extends Component {
  render() {
    return (<PageHeaderWrapper content={<FormattedMessage id="authority-role.header.description" />}>
      <RoleTable />
    </PageHeaderWrapper>)
  }
}

export default AuthorityRole