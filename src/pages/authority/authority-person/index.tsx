import React, { PureComponent } from 'react'
import { connect } from 'dva';
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
import { Person } from './data.d'
import { SetMethod } from '@/utils/axios'
import { setPerson } from './service'
import { Role } from '@/pages/authority/authority-role/data'
import { setRole } from '@/pages/authority/authority-role/service'
import PersonTable from './components/table'
import PersonForm from './components/from'
import styles from './style.less'
import { getResourcesAuthById } from '@/utils/utils'

interface PersonState {
  roleList: Role[],
  authority: string[],
  personList: Person[],
  actionTag: Person,
  drawerVisible: boolean,
  actionType: 'add' | 'edit' | 'delete' | null,
  pageIndex: number,
  pageSize: number,
  dataTotal: number,
  getListLoading: boolean,
  upDataLoading: boolean,
}

interface PersonProps {
  loading: boolean,
}

// 因为loading 导致每次请求后引发页面更新
@connect(({ loading, }: ConnectState) => ({
  loading: loading.effects['role/getRoleList']
}),
)
class AuthorityPerson extends PureComponent<PersonProps, PersonState>{
  state: PersonState = {
    roleList: [],
    authority: [],
    personList: [],
    actionTag: {}, // 当前表单内容
    drawerVisible: false, // 是否打开表单
    actionType: null, // 点击按钮操作的类型
    pageIndex: 1, // 分页
    pageSize: 6,//
    dataTotal: 0,
    getListLoading: false,
    upDataLoading: false,
  }

  constructor(props: PersonProps) {
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
    if (!getResourcesAuthById(37)) {
      notification.error({
        description: formatMessage({ id: 'component.not-role' }),
        message: formatMessage({ id: 'component.error' }),
      });
      return;
    }
    try {
      this.setState({
        getListLoading: true
      })
      await Promise.all([this.getRoleList(), this.getPersonList()])
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

  // 获取权限角色数组
  getRoleList = async () => {
    try {
      const res = await setRole({ data: {}, method: SetMethod['get'] })
      this.setState({
        roleList: res.data
      })
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }

  // 获取 人员数组
  getPersonList = async () => {
    try {
      const { pageIndex, pageSize } = this.state
      this.setState({
        getListLoading: true
      })
      const res = await setPerson({
        data: {
          pageIndex: pageIndex - 1, pageSize
        }, method: SetMethod['get']
      })
      this.setState({
        personList: res.data.elements,
        dataTotal: res.data.totalElements,
        getListLoading: false
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

  handleBtnClickEdit = async (row: Person) => {
    this.setState({
      actionTag: row,
      actionType: 'edit',
      drawerVisible: true
    })
  }

  // 点击删除浮窗的确认按钮
  handleBtnClickDeleteUpData = async (row: Person) => {
    try {
      this.setState({
        upDataLoading: true
      })
      const res = await setPerson({ data: { userId: row.id }, method: SetMethod['delete'] })
      this.getPersonList()
      this.setState({
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
  handleFormSubmit = async (form: Person) => {
    try {
      const { actionType } = this.state
      let res: { data?: Person | number, errorMsg: string } = { errorMsg: formatMessage({ id: 'component.action-error' }) }
      this.setState({
        upDataLoading: true
      })
      // form.roleIds = [form.roleId!]
      if (actionType === 'edit') {
        res = await setPerson({ data: form, method: SetMethod['edit'] })
        this.getPersonList()
      } else if (actionType === 'add') {
        res = await setPerson({ data: form, method: SetMethod['add'] })
        this.setState({
          pageIndex: 1
        }, this.getPersonList)
      }
      this.setState({
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

  handleTableOnChange = async (page: number, pageSize?: number | undefined) => {
    this.setState({
      pageIndex: page
    }, this.getPersonList)
  }

  render() {
    const { personList, roleList, pageIndex, pageSize, dataTotal, authority, actionType, actionTag, drawerVisible, upDataLoading, getListLoading } = this.state
    const { loading } = this.props
    return (
      <PageHeaderWrapper content={<FormattedMessage id="authority-person.header.description" />}>
        <Card loading={loading}>
          <Alert className={styles['authority-person-warning']} message={formatMessage({ id: 'authority-person.warning' })} type="warning" />

          {
            getResourcesAuthById(38) && <div className='box box-row-end btn-mb'>
              <Button size="large" type="primary" style={{ float: 'right' }} onClick={this.handleBtnClickAdd}>
                <FormattedMessage id='component.add'></FormattedMessage>
              </Button>
            </div>
          }
          <PersonTable
            dataTotal={dataTotal}
            pageIndex={pageIndex}
            pageSize={pageSize}
            authority={authority}
            personList={personList}
            upDataLoading={upDataLoading}
            getListLoading={getListLoading}
            handleBtnClickEdit={this.handleBtnClickEdit}
            handleBtnClickDeleteUpData={this.handleBtnClickDeleteUpData}
            handleTableOnChange={this.handleTableOnChange}
          />
        </Card>
        <Drawer
          title={`${actionType ? formatMessage({ id: 'authority-person.table.' + actionType }) : ''} ${actionTag.username || ''}`}
          placement="right"
          width={720}
          closable={false}
          maskClosable={false}
          destroyOnClose={true}
          onClose={this.initActionTag}
          visible={drawerVisible}
        >
          <PersonForm
            roleList={roleList}
            actionTag={actionTag}
            upDataLoading={upDataLoading}
            onClose={this.initActionTag}
            onSubmit={this.handleFormSubmit} />
        </Drawer>
      </PageHeaderWrapper>
    )
  }
}

export default AuthorityPerson