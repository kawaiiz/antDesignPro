import React, { PureComponent } from 'react'
import { connect } from 'dva';
import { Dispatch } from 'redux';
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
import { ConnectState } from '@/models/connect';
import styles from './style.less'

import { Auth } from './data.d'
import { SetMethod } from '@/utils/axios'
import { getAuthTree, setAuth } from './service'

import { ResourcesTag } from '@/pages/authority/authority-resources/data';
import { getResourcesListAll } from '../authority-resources/service'
import { MyConfig } from 'config';

import AuthTable from './components/table'
import AuthForm from './components/from'

interface AuthState {
  authority: string[],
  authList: Auth[],
  resourcesList: ResourcesTag[],
  actionTag: Auth,
  drawerVisible: boolean,
  actionType: 'add' | 'edit' | 'delete' | null,
  getListLoading: boolean,
  upDataLoading: boolean,
}

interface AuthProps {
  dispatch: Dispatch;
  loading: boolean,
}

// 因为loading 导致每次请求后引发页面更新
@connect(({ loading, }: ConnectState) => ({
  loading: loading.effects['role/getRoleList']
}),
)
class AuthoritySet extends PureComponent<AuthProps, AuthState>{
  state: AuthState = {
    authority: [],
    authList: [],
    resourcesList: [],
    actionTag: {}, // 当前表单内容
    drawerVisible: false, // 是否打开表单
    actionType: null, // 点击按钮操作的类型
    getListLoading: false,
    upDataLoading: false,
  }

  constructor(props: AuthProps) {
    super(props)
    // const authority = getAuthority()
    // this.state.authority = typeof authority === 'string' ? authority : authority[0]
  }

  componentDidMount() {
    this.setState({
      authority: getAuthority() as string[]
    })
    this.getList()
  }

  getList = async () => {
    try {
      this.setState({
        getListLoading: true
      })
      await Promise.all([this.getAuthTree(), this.getResourcesListAll()])
      this.setState({
        getListLoading: false
      })
    } catch (e) {
      this.setState({
        getListLoading: false
      })
      console.log(e)
      notification.error({
        description: e.errorMsg,
        message: formatMessage({ id: 'component.error' }),
      });
    }
  }


  // 获取 權限数组
  getAuthTree = async () => {
    try {
      const res = await getAuthTree()
      this.setState({
        authList: res.data,
      })
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }

  // 获取所有资源数组
  getResourcesListAll = async () => {
    try {
      const res = await getResourcesListAll()
      this.setState({
        resourcesList: res.data,
      })
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }


  // 每次关闭抽屉的时候 清空活跃项
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

  handleBtnClickEdit = async (row: Auth) => {
    this.setState({
      actionTag: row,
      actionType: 'edit',
      drawerVisible: true
    })
  }

  // 点击删除浮窗的确认按钮
  handleBtnClickDeleteUpData = async (row: Auth) => {
    try {
      this.setState({
        upDataLoading: true
      })
      const res = await setAuth({ data: { htmlId: row.htmlId }, method: SetMethod['delete'] })
      this.getAuthTree()
      this.setState({
        upDataLoading: false
      })
      notification.success({
        description: res.errorMsg ? res.errorMsg : formatMessage({ id: 'component.action-success' }),
        message: formatMessage({ id: 'component.success' }),
      });
      const { dispatch } = this.props
      // 获取权限列表
      dispatch({
        type: 'auth/getGlobalAuthTree',
      });
    } catch (e) {
      this.setState({
        upDataLoading: false
      })
      notification.error({
        description: e.errorMsg,
        message: formatMessage({ id: 'component.error' }),
      });
    }
  }

  // 表单提交事件
  handleFormSubmit = async (form: Auth) => {
    try {
      const { actionType } = this.state
      let res: { data?: Auth | number, errorMsg: string } = { errorMsg: formatMessage({ id: 'component.action-error' }) }
      this.setState({
        upDataLoading: true
      })
      if (actionType === 'edit') {
        res = await setAuth({ data: form, method: SetMethod['edit'] })
        this.getAuthTree()
      } else if (actionType === 'add') {
        res = await setAuth({ data: form, method: SetMethod['add'] })
        this.getAuthTree()
      }
      this.setState({
        upDataLoading: false
      })
      notification.success({
        description: res.errorMsg ? res.errorMsg : formatMessage({ id: 'component.action-success' }),
        message: formatMessage({ id: 'component.success' }),
      });
      this.initActionTag()
      const { dispatch } = this.props
      // 获取权限列表
      dispatch({
        type: 'auth/getGlobalAuthTree',
      });
    } catch (e) {
      this.setState({
        upDataLoading: false
      })
      notification.error({
        description: e.errorMsg ? e.errorMsg : formatMessage({ id: 'component.action-error' }),
        message: formatMessage({ id: 'component.error' }),
      });
    }
  }

  render() {
    const { authList, authority, actionType, actionTag, drawerVisible, upDataLoading, getListLoading, resourcesList } = this.state

    const { loading } = this.props
    return (
      <PageHeaderWrapper content={<FormattedMessage id="authority-auth.header.description" />}>
        <Card loading={loading}>
          <Alert className={styles['authority-auth-warning']} message={formatMessage({ id: 'authority-auth.warning' })} type="warning" />
          {
            authority.includes(MyConfig.SUPER_ADMIN) && <div className='box box-row-end btn-mb'>
              <Button size="large" type="primary" style={{ float: 'right' }} onClick={this.handleBtnClickAdd}>
                <FormattedMessage id='component.add'></FormattedMessage>
              </Button>
            </div>
          }
          <AuthTable
            authority={authority}
            authList={authList}
            upDataLoading={upDataLoading}
            getListLoading={getListLoading}
            handleBtnClickEdit={this.handleBtnClickEdit}
            handleBtnClickDeleteUpData={this.handleBtnClickDeleteUpData}
          />
        </Card>
        <Drawer
          title={`${actionType ? formatMessage({ id: 'authority-auth.table.' + actionType }) : ''} ${actionTag.htmlName || ''}`}
          placement="right"
          width={720}
          closable={false}
          maskClosable={false}
          destroyOnClose={true}
          onClose={this.initActionTag}
          visible={drawerVisible}
        >
          <AuthForm
            resourcesList={resourcesList}
            actionTag={actionTag}
            actionType={actionType}
            authList={authList}
            upDataLoading={upDataLoading}
            onClose={this.initActionTag}
            onSubmit={this.handleFormSubmit} />
        </Drawer>
      </PageHeaderWrapper>
    )
  }
}

export default AuthoritySet