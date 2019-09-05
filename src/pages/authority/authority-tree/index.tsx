
import React, { Component } from 'react'
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { ConnectState } from '@/models/connect';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { IRoute } from 'umi-types/config'
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

import TreeTable from './components/tree'
import TreeForm from './components/from'
import styles from './style.less'

interface AuthState {
  authority: string,
  actionTag: IRoute,
  drawerVisible: boolean,
  actionType: 'add' | 'edit' | 'delete' | null
}

interface Authprops {
  dispatch: Dispatch<any>,
  authList: IRoute[],
  loading: boolean
}

@connect(({ auth, loading }: ConnectState) => ({
  authList: auth.authList,
  loading: loading.effects['auth/getAuthList'] || loading.effects['auth/upDataAuthList'],
}))
class AuthorityTree extends Component<Authprops, AuthState> {
  state: AuthState = {
    authority: '',
    actionTag: {
      name: '',
      path: '',
      hideInMenu: true,
      icon: '',
      component: '',
      authority: null,
      index: []
    }, // 当前表单内容
    drawerVisible: false, // 是否打开表单
    actionType: null // 点击按钮操作的类型
  }

  constructor(props: Authprops) {
    super(props)
    const authority = getAuthority()
    this.state.authority = typeof authority === 'string' ? authority : authority[0]
  }


  // 每次关闭的时候 清空活跃项
  initActionTag = () => {
    this.setState({
      actionTag: {
        name: '',
        path: '',
        hideInMenu: true,
        icon: '',
        component: '',
        authority: null,
        index: [],
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

  // 点击删除浮窗的确认按钮
  handleBtnClickDeleteUpData = (row: IRoute) => {
    const { dispatch, authList } = this.props;
    let newAuthList = lodash.cloneDeep(authList)
    this.seek(newAuthList, row, 0)
    newAuthList = this.createAuthListIndex(newAuthList, [])
    dispatch({
      type: 'auth/setAuth',
      payload: { data: newAuthList, type: 'del' }
    });
  }

  // 表单提交事件 修改比新增多一个删除原来的自己的操作 其他的
  handleFormSubmit = async (form: IRoute, parentIndex: number[]) => {
    try {
      // 先比对，找到是哪一条数据  删除原数据  再通过新的父节点添加新数据
      const { actionTag } = this.state
      const { dispatch, authList } = this.props;
      let newAuthList = lodash.cloneDeep(authList)
      if (this.state.actionType === 'edit') {
        form.children = lodash.cloneDeep(actionTag.children)
        this.seek(newAuthList, actionTag, 0)
      }
      if (parentIndex.length === 0) {
        newAuthList.push(form)
      } else {
        newAuthList = this.addAuth(newAuthList, form, parentIndex)
      }
      newAuthList = this.createAuthListIndex(newAuthList, [])
      dispatch({
        type: 'auth/setAuth',
        payload: { data: newAuthList, type: 'edit' }
      });
      this.initActionTag()
    } catch (e) {
      notification.error({
        description: e.message,
        message: formatMessage({ id: 'component.error' }),
      });
    }
  }

  // createIndex 生成操作更新后的序号  parentIndex:父节点的序号
  createAuthListIndex(authList: IRoute[], parentIndex: number[]) {
    return authList.map((item, index) => {
      item.index = [...parentIndex, index]
      if (item.children && item.children.length > 0) {
        item.children = this.createAuthListIndex(item.children, item.index)
      }
      return item
    })
  }

  // 找到节点并删除
  seek = (authList: IRoute[], row: IRoute, level: number) => {
    level++
    if (row.index.length === level) {
      authList.splice(row.index[level - 1], 1)
    } else {
      this.seek(authList[row.index[level - 1]].children, row, level)
    }
  }

  // 传入列表与编辑的表单内容与最新的父节点的index,生成最新的权限组合
  addAuth = (authList: IRoute[], form: IRoute, parentIndex: number[]) => {
    return authList.map((item, index) => {
      if (JSON.stringify(item.index) === JSON.stringify(parentIndex)) {
        item.children.push(form)
      }
      if (item.children && item.children.length > 0) {
        item.children = this.addAuth(item.children, form, parentIndex)
      }
      return item
    });
  }

  render() {
    const { authority, drawerVisible, actionTag, actionType } = this.state
    const { authList, loading } = this.props
    return (<PageHeaderWrapper content={<FormattedMessage id="authority-tree.header.description" />}>
      <Card loading={loading}>
        <Alert className={styles['authority-tree-warning']} message={formatMessage({ id: 'authority-tree.warning' })} type="warning" />
        <div className={styles['authority-add-button']}>
          <Button size="large" type="primary" style={{ float: 'right' }} onClick={this.handleBtnClickAdd}>
            <FormattedMessage id='component.add'></FormattedMessage>
          </Button>
        </div>
        {
          authList.length > 0 ? (<div>
            <TreeTable
              authority={authority}
              authList={authList}
              handleBtnClickEdit={this.handleBtnClickEdit}
              handleBtnClickDeleteUpData={this.handleBtnClickDeleteUpData}
            />
          </div>) : <Empty description={false} />
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
        {drawerVisible ? <TreeForm actionTag={actionTag} authList={authList} onClose={this.initActionTag} onSubmit={this.handleFormSubmit} /> : null}
      </Drawer>
    </PageHeaderWrapper >);
  }
}

export default AuthorityTree