import React, { PureComponent } from 'react'
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { ConnectState } from '@/models/connect';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { getAuthority } from '@/utils/authority'
import {
  Card,
  Alert,
  Drawer,
  Button,
  notification
} from 'antd';

import TreeTable from './components/tree'
import TreeForm from './components/from'
import styles from './style.less'
import { IRoute } from 'umi-types/config'
import { getResourcesAuthById } from '@/utils/utils'
// import { MyConfig } from '_config/config';
import { MyConfig } from 'config';

interface AuthState {
  authority: string,
  actionTag: IRoute,
  drawerVisible: boolean,
  actionType: 'add' | 'edit' | 'delete' | null,
}

interface Authprops {
  dispatch: Dispatch<any>,
  originalAuthList: IRoute[],
  authList: IRoute[],
  loading: boolean,
}

@connect(({ auth, loading }: ConnectState) => ({
  originalAuthList: auth.originalAuthList,
  authList: auth.authList,
  loading: loading.effects['auth/getAuthList'] || loading.effects['auth/upDataAuthList'],
}))
class AuthorityTree extends PureComponent<Authprops, AuthState> {
  state: AuthState = {
    authority: '',
    actionTag: {
      id: '',
      parentId: '',
      name: '',
      path: '',
      hideInMenu: null,
      icon: '',
      component: '',
      authority: null,
    }, // 当前表单内容
    drawerVisible: false, // 是否打开表单
    actionType: null, // 点击按钮操作的类型
  }

  constructor(props: Authprops) {
    super(props)
    const authority = getAuthority()
    this.state.authority = typeof authority === 'string' ? authority : authority[0]
  }

  // 每次关闭抽屉的时候 清空活跃项
  initActionTag = () => {
    this.setState({
      actionTag: {
        id: '',
        parentId: '',
        name: '',
        path: '',
        hideInMenu: null,
        icon: '',
        component: '',
        authority: null,
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
    const { dispatch } = this.props;
    dispatch({
      type: 'auth/setAuth',
      payload: { data: { resourceId: row.id }, type: 'delete' }
    });
  }

  // 表单提交事件
  handleFormSubmit = async (form: IRoute) => {
    try {
      // 先比对，找到是哪一条数据  删除原数据  再通过新的父节点添加新数据
      const { actionTag } = this.state
      const { dispatch } = this.props;
      dispatch({
        type: 'auth/setAuth',
        payload: { data: form, type: actionTag.id ? 'edit' : 'add' }
      });
      this.initActionTag()
    } catch (e) {
      notification.error({
        description: e.errorMsg,
        message: formatMessage({ id: 'component.error' }),
      });
    }
  }

  render() {
    const { authority, drawerVisible, actionTag, actionType } = this.state
    const { originalAuthList, authList, loading } = this.props
    return (<PageHeaderWrapper content={<FormattedMessage id="authority-tree.header.description" />}>
      <Card loading={loading}>
        <Alert className={styles['authority-tree-warning']} message={formatMessage({ id: 'authority-tree.warning' })} type="warning" />
        {
          authority === MyConfig.SUPER_ADMIN && <div className='box box-row-end btn-mb'>
            <Button size="large" type="primary" style={{ float: 'right' }} onClick={this.handleBtnClickAdd}>
              <FormattedMessage id='component.add'></FormattedMessage>
            </Button>
          </div>
        }
        <TreeTable
          authority={authority}
          originalAuthList={originalAuthList}
          handleBtnClickEdit={this.handleBtnClickEdit}
          handleBtnClickDeleteUpData={this.handleBtnClickDeleteUpData}
        />
      </Card>
      <Drawer
        title={`${actionType ? formatMessage({ id: 'authority-tree.table.' + actionType }) : ''} ${actionTag.name}`}
        placement="right"
        width={720}
        closable={false}
        maskClosable={false}
        destroyOnClose={true}
        onClose={this.initActionTag}
        visible={drawerVisible}
      >
        <TreeForm
          actionTag={actionTag}
          authList={authList}
          onClose={this.initActionTag}
          onSubmit={this.handleFormSubmit} />
      </Drawer>
    </PageHeaderWrapper >);
  }
}

export default AuthorityTree