import React, { Component } from 'react'
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { getAuthority } from '@/utils/authority'
import lodash from 'lodash'
import {
  Card,
  Empty,
  Alert,
  Drawer,
  Button,
  notification
} from 'antd';

import { ConnectState } from '@/models/connect';
import { Role } from './data.d'
import { IRoute } from 'umi-types/config';

import RoleTable from './components/table'
import RoleForm from './components/from'
import styles from './style.less'

interface RoleProps {
  dispatch: Dispatch<any>,
  roleList: Role[],
  allAuthList: [],
  originalAuthList: [],
  loading: boolean
}

interface RoleState {
  authority: string,
  actionTag: Role,
  drawerVisible: boolean,
  actionType: 'add' | 'edit' | 'delete' | null
}

@connect(({ auth, role, loading, }: ConnectState) => ({
  roleList: role.roleList,
  allAuthList: auth.allAuthList,
  originalAuthList: auth.originalAuthList,
  loading: loading.effects['role/getRoleList'] || loading.effects['role/setRole'],
}),
)
class AuthorityRole extends Component<RoleProps, RoleState> {
  state: RoleState = {
    authority: '',
    actionTag: {}, // 当前表单内容
    drawerVisible: false, // 是否打开表单
    actionType: null // 点击按钮操作的类型
  }
  constructor(props: RoleProps) {
    super(props)
    const authority = getAuthority()
    this.state.authority = typeof authority === 'string' ? authority : authority[0]
    this.getRoleList()
  }

  // 获取数组
  getRoleList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/getRoleList'
    });
  }

  // 每次关闭的时候 清空活跃项
  initActionTag = () => {
    this.setState({
      actionTag: {},
      actionType: null,
      drawerVisible: false,
    })
  }


  handleBtnClickAdd = () => {
    this.setState({
      actionType: 'add',
      drawerVisible: true
    })
  }
  handleBtnClickEdit = (row: Role) => {
    this.setState({
      actionTag: row,
      actionType: 'edit',
      drawerVisible: true
    })
  }

  // 点击删除浮窗的确认按钮
  handleBtnClickDeleteUpData = (row: Role) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/setRole',
      payload: { data: row, type: 'delete' }
    });
  }

  // 表单提交事件
  handleFormSubmit = async (form: Role) => {
    try {
      // 先比对，找到是哪一条数据  删除原数据  再通过新的父节点添加新数据
      const { actionTag } = this.state
      const { dispatch } = this.props;
      dispatch({
        type: 'role/setRole',
        payload: { data: form, type: actionTag.id ? 'edit' : 'add' }
      });
      this.initActionTag()
    } catch (e) {
      notification.error({
        description: e.message,
        message: formatMessage({ id: 'component.error' }),
      });
    }
  }
  render() {
    const { authority, drawerVisible, actionTag, actionType } = this.state
    const { roleList, loading, allAuthList, originalAuthList } = this.props
    return (<PageHeaderWrapper content={<FormattedMessage id="authority-role.header.description" />}>
      <Card loading={loading}>
        <Alert className={styles['authority-role-warning']} message={formatMessage({ id: 'authority-tree.warning' })} type="warning" />
        <div className={styles['authority-add-button']}>
          <Button size="large" type="primary" style={{ float: 'right' }} onClick={this.handleBtnClickAdd}>
            <FormattedMessage id='component.add'></FormattedMessage>
          </Button>
        </div>
        {
          roleList.length > 0 ? (<div>
            <RoleTable
              authority={authority}
              roleList={roleList}
              handleBtnClickEdit={this.handleBtnClickEdit}
              handleBtnClickDeleteUpData={this.handleBtnClickDeleteUpData}
            />
          </div>) : <Empty description={false} />
        }
      </Card>
      <Drawer
        title={`${actionType ? formatMessage({ id: 'authority-role.table.' + actionType }) : ''} ${actionTag.name}`}
        placement="right"
        width={720}
        closable={false}
        maskClosable={false}
        onClose={this.initActionTag}
        visible={drawerVisible}
      >
        {drawerVisible ? <RoleForm actionTag={actionTag} originalAuthList={originalAuthList} allAuthList={allAuthList} onClose={this.initActionTag} onSubmit={this.handleFormSubmit} /> : null}
      </Drawer>
    </PageHeaderWrapper>)
  }
}

export default AuthorityRole