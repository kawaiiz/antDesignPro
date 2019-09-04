
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
import { IRoute } from 'umi-types/config'
import { getAuthority } from '@/utils/authority'
import lodash from 'lodash'
import { notification } from 'antd';


import AuthTree from './components/tree'
import AuthForm from './components/from'
import styles from './style.less'
import { func } from 'prop-types';

interface AuthState {
  authList: IRoute[],
  loading: boolean,
  authority: string,
  actionTag: IRoute,
  drawerVisible: boolean,
  actionType: 'add' | 'edit' | 'delete' | null
}

interface Authprops {
  dispatch: Dispatch<any>,
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
      hideInMenu: true,
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
        hideInMenu: true,
        icon: '',
        component: '',
      },
      actionType: null,
      drawerVisible: false,
    })
  }

  //点击新增按钮
  handleBtnClickAdd = () => {
    this.setState({
      actionType: 'add',
      drawerVisible: true
    })
  }

  // 点击修改按钮
  handleBtnClickEdit = (row: IRoute) => {
    this.setState({
      actionTag: row,
      actionType: 'edit',
      drawerVisible: true
    })
  }

  // 修改提交
  handleBtnClickEditUpData = async (from: IRoute) => {
    function _seek(authList: IRoute[], actionTag: IRoute): IRoute[] {
      return authList.map(item => {
        if (item.children && item.children.length > 0) {
          item.children = _seek(item.children, actionTag)
        }
        if (item.name === actionTag.name) {
          return Object.assign(item, from)
        } else {
          return item
        }
      })
    }
    try {
      // 先比对，找到是哪一条数据 将state 里存着的点击actionTag 和列表比
      const { actionTag, authList } = this.state
      const { dispatch } = this.props;
      const newAuthList = _seek(authList, actionTag)
      await dispatch({
        type: 'global/upDataAuthList',
        payload: { authList: newAuthList }
      });
      // 本来这里应该执行初始化弹窗，但是由于更新了权限数组，整个页面都重绘了 所以不需要了
      // this.initActionTag()
    } catch (e) {
      notification.error({
        description: e.message,
        message: formatMessage({ id: 'component.error' }),
      });
      console.log(e)
    }
  }

  // 新增提交
  handleBtnClickAddUpData = (from: IRoute) => {

  }

  // 表单提交事件 
  handleFormSubmit = (form: IRoute) => {
    if (this.state.actionType === 'add') this.handleBtnClickAddUpData(form);
    else if (this.state.actionType === 'edit') this.handleBtnClickEditUpData(form);
  }

  // 点击删除浮窗的确认按钮
  handleBtnClickDeleteUpData = (row: IRoute) => {
    function _seek(authList: IRoute[], actionTag: IRoute) {
      authList.forEach((item, index) => {
        if (item.name === actionTag.name) {
          authList.splice(index, 1)
        } else {
          if (item.children && item.children.length > 0) {
            item.children = _seek(item.children, actionTag)
          }
        }
      })
    }
    const { authList } = this.state
    const { dispatch } = this.props;
    let newAuthList = lodash.cloneDeep(authList)
    _seek(newAuthList, row)
    dispatch({
      type: 'global/upDataAuthList',
      payload: { authList: newAuthList }
    });
  }

  render() {
    const { authList, authority, drawerVisible, actionTag, actionType } = this.state
    const { getAuthListLoading } = this.props
    return (<PageHeaderWrapper content={<FormattedMessage id="authority-tree.header.description" />}>
      <Card loading={getAuthListLoading}>
        <Alert className={styles['authority-tree-warning']} message={formatMessage({ id: 'authority-tree.warning' })} type="warning" />
        <div className={styles['authority-add-button']}>
          <Button size="large" type="primary" style={{ float: 'right' }} onClick={this.handleBtnClickAdd}>
            <FormattedMessage id='component.add'></FormattedMessage>
          </Button>
        </div>
        {
          authList.length > 0 ? (<Row>
            <AuthTree
              authority={authority}
              authList={authList}
              handleBtnClickEdit={this.handleBtnClickEdit}
              handleBtnClickDeleteUpData={this.handleBtnClickDeleteUpData}
            />
          </Row>) : <Empty description={false} />
        }
      </Card>
      <Drawer
        title={`${actionType ? formatMessage({ id: 'authority-tree.table.' + actionType }) : ''} ${actionTag.name}`}
        placement="right"
        width={720}
        closable={false}
        maskClosable={false}
        onClose={this.initActionTag}
        visible={drawerVisible}
      >
        {drawerVisible ? <AuthForm actionTag={actionTag} onClose={this.initActionTag} onSubmit={this.handleFormSubmit} /> : null}
      </Drawer>
    </PageHeaderWrapper >);
  }
}

export default AuthorityTree