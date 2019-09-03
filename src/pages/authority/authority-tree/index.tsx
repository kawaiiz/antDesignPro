
import React, { Component } from 'react'
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { ConnectState } from '@/models/connect';
import {
  Card,
  Empty,
  Row,
  Col,
  Alert,
  Drawer,
  Badge,
  Button,
  DatePicker,
  Divider,
  Dropdown,
  Form,
  Icon,
  Input,
  InputNumber,
  Menu,
  message, // 信息
} from 'antd';

import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { getAuthority } from '@/utils/authority'

import { IRoute } from 'umi-types/config'

import AuthTree from './components/tree'

import styles from './style.less'

interface AuthState {
  authList: IRoute[],
  loading: boolean,
  authority: string,
  actionTag: IRoute,
  drawerVisible: boolean,
  actionType: 'add' | 'edit' | 'delete' | null
}

interface Authprops {
  authList: IRoute[],
  getAuthListLoading: boolean
}

@connect(({ global, loading }: ConnectState) => ({
  authList: global.authList,
  getAuthListLoading: loading.effects['global/getAuthList'],
}))
class AuthorityTree extends Component<Authprops, AuthState> {
  state: AuthState = {
    authList: [],
    loading: false,
    authority: '',
    actionTag: {
      name: '',
      path: '',
      icon: '',
      component: '',
    }, // 当前表单内容
    drawerVisible: false, // 是否打开表单
    actionType: null // 点击按钮操作的类型
  }

  constructor(props: Authprops) {
    super(props)
    const { authList } = props
    const authority = getAuthority()
    this.state.authList = [...authList]
    this.state.authority = typeof authority === 'string' ? authority : authority[0]
  }

  // 每次关闭的时候 清空表单 
  initActionTag = () => {
    this.setState({
      actionTag: {
        name: '',
        path: '',
        icon: '',
        component: '',
      },
      actionType: null,
      drawerVisible: false,
    })
  }

  // 点击修改按钮
  handleBtnClickEdit = (row: IRoute) => {
    this.setState({
      actionTag: row,
      actionType: 'edit',
      drawerVisible: true
    })
    console.log(row)
  }

  // 修改提交
  handleBtnClickEditUpData = (row: IRoute, index: number) => {

  }

  // 点击删除浮窗的确认按钮
  handleBtnClickDeleteUpData = (row: IRoute) => {
    console.log(row)
  }

  render() {
    const { authList, authority, drawerVisible, actionTag, actionType } = this.state
    const { getAuthListLoading } = this.props
    return (<PageHeaderWrapper content={<FormattedMessage id="authority-tree.header.description" />}>
      <Card loading={getAuthListLoading}>
        <Alert className={styles['authority-tree-warning']} message={formatMessage({ id: 'authority-trre.warning' })} type="warning" />
        {
          authList.length > 0 ? (<Row>
            <Col>
              <AuthTree
                authority={authority}
                authList={authList}
                handleBtnClickEdit={this.handleBtnClickEdit}
                handleBtnClickDeleteUpData={this.handleBtnClickDeleteUpData}
              /></Col>
            <Col></Col>
          </Row>) : <Empty description={false} />
        }
      </Card>
      <Drawer
        title={`${actionType ? formatMessage({ id: 'authority-trre.table.' + actionType }) : ''} ${actionTag.name}`}
        placement="right"
        closable={false}
        onClose={this.initActionTag}
        visible={drawerVisible}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </PageHeaderWrapper >);
  }
}

export default AuthorityTree