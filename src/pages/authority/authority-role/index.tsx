import React, { PureComponent } from 'react'
import { connect } from 'dva';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { getAuthority } from '@/utils/authority'
import lodash from 'lodash'
import {
  Card,
  Alert,
  Drawer,
  Button,
  notification,
} from 'antd';
import { IRoute } from 'umi-types/config'

import { ConnectState } from '@/models/connect';
import { Role } from './data.d'

import { setRole, getRoleDetail } from './service';
import { SetMethod } from '@/utils/axios'

import RoleTable from './components/table'
import RoleForm from './components/from'
import styles from './style.less'
import { getResourcesAuthById } from '@/utils/utils'

interface RoleState {
  roleList: Role[],
  authority: string,
  actionTag: Role,
  drawerVisible: boolean,
  actionType: 'add' | 'edit' | 'delete' | null,
  getListLoading: boolean,
  upDataLoading: boolean,
}

interface RoleProps {
  allAuthList: IRoute[],
  originalAuthList: IRoute[],
  loading: boolean,
}

// 因为loading 导致每次请求后引发页面更新
@connect(({ auth, loading, }: ConnectState) => ({
  allAuthList: auth.allAuthList,
  originalAuthList: auth.originalAuthList,
  loading: loading.effects['role/getRoleList'] || loading.effects['role/setRole'],
}),
)
class AuthorityRole extends PureComponent<RoleProps, RoleState> {
  state: RoleState = {
    roleList: [],
    authority: '',
    actionTag: {}, // 当前表单内容
    drawerVisible: false, // 是否打开表单
    actionType: null, // 点击按钮操作的类型
    getListLoading: false,
    upDataLoading: false,
  }

  constructor(props: RoleProps) {
    super(props)
    const authority = getAuthority()
    this.state.authority = typeof authority === 'string' ? authority : authority[0]
  }

  componentDidMount() {
    this.getRoleList()
  }
  // 获取角色数组
  getRoleList = async () => {
    try {
      this.setState({
        getListLoading: true
      })
      const res = await setRole({ data: {}, method: SetMethod['get'] })
      this.setState({
        roleList: res.data,
        getListLoading: false
      })
    } catch (e) {
      console.log(e)
      this.setState({
        getListLoading: false
      })
      notification.error({
        description: e.errorMsg,
        message: formatMessage({ id: 'component.error' }),
      });
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
    const { actionTag } = this.state
    const { originalAuthList } = this.props
    const resourceIds = originalAuthList.map(item => item.id)
    this.setState({
      actionTag: Object.assign({}, actionTag, { resourceIds }),
      actionType: 'add',
      drawerVisible: true
    })
  }

  // 点击修改 请求这个角色的权限id数组 融合进去
  handleBtnClickEdit = async (row: Role) => {
    try {
      this.setState({
        upDataLoading: true
      })
      const res = await getRoleDetail({ roleId: row.roleId! })
      this.setState({
        actionTag: Object.assign({}, row, { resourceIds: res.data }),
        actionType: 'edit',
        drawerVisible: true,
        upDataLoading: false
      })
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

  // 点击删除浮窗的确认按钮
  handleBtnClickDeleteUpData = async (row: Role) => {
    const { roleList } = this.state
    const oldRoleList = lodash.cloneDeep(roleList)
    try {
      this.setState({
        upDataLoading: true
      })
      const res = await setRole({ data: { roleId: row.roleId }, method: SetMethod['delete'] })
      for (let i = 0; i < oldRoleList.length; i++) {
        if (oldRoleList[i].roleId === res.data as number) {
          oldRoleList.splice(i, 1)
          break
        }
      }
      this.setState({
        roleList: oldRoleList,
        upDataLoading: false
      })
      notification.success({
        description: res.errorMsg ? res.errorMsg : formatMessage({ id: 'component.action-success' }),
        message: formatMessage({ id: 'component.success' }),
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
  handleFormSubmit = async (form: Role) => {
    try {
      const { actionType, roleList } = this.state
      const oldRoleList = lodash.cloneDeep(roleList)
      let res: { data?: Role | number, errorMsg: string } = { errorMsg: formatMessage({ id: 'component.action-error' }) }, newRoleList: Role[] = []
      this.setState({
        upDataLoading: true
      })
      if (actionType === 'edit') {
        res = await setRole({ data: form, method: SetMethod['edit']})
        newRoleList = oldRoleList.map(item => {
          if (item.roleId === (res.data as Role).roleId) {
            return Object.assign({}, item, res.data)
          }
          return item
        })
      } else if (actionType === 'add') {
        res = await setRole({ data: form, method: SetMethod['add'] })
        oldRoleList.push(res.data as Role)
        newRoleList = oldRoleList
      }
      this.setState({
        roleList: newRoleList,
        upDataLoading: false
      })
      notification.success({
        description: res.errorMsg ? res.errorMsg : formatMessage({ id: 'component.action-success' }),
        message: formatMessage({ id: 'component.success' }),
      });
      this.initActionTag()
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
    const { authority, drawerVisible, actionTag, actionType, roleList, upDataLoading, getListLoading, } = this.state
    const { loading, allAuthList, originalAuthList } = this.props
    return (<PageHeaderWrapper content={<FormattedMessage id="authority-role.header.description" />}>
      <Card loading={loading}>
        <Alert className={styles['authority-role-warning']} message={formatMessage({ id: 'authority-role.warning' })} type="warning" />
        {/* 新增按钮 */}
        {
          getResourcesAuthById(9) && <div className='box box-row-end btn-mb'>
            <Button size="large" type="primary" style={{ float: 'right' }} onClick={this.handleBtnClickAdd}>
              <FormattedMessage id='component.add'></FormattedMessage>
            </Button>
          </div>
        }

        <RoleTable
          authority={authority}
          roleList={roleList}
          getListLoading={getListLoading}
          handleBtnClickEdit={this.handleBtnClickEdit}
          handleBtnClickDeleteUpData={this.handleBtnClickDeleteUpData}
        />
      </Card>
      <Drawer
        title={`${actionType ? formatMessage({ id: 'authority-role.table.' + actionType }) : ''} ${actionTag.roleName || ''}`}
        placement="right"
        width={720}
        closable={false}
        maskClosable={false}
        destroyOnClose={true}
        onClose={this.initActionTag}
        visible={drawerVisible}
      >
        <RoleForm
          actionTag={actionTag}
          actionType={actionType}
          originalAuthList={originalAuthList}
          upDataLoading={upDataLoading}
          allAuthList={allAuthList}
          onClose={this.initActionTag}
          onSubmit={this.handleFormSubmit} />
      </Drawer>
    </PageHeaderWrapper>)
  }
}

export default AuthorityRole