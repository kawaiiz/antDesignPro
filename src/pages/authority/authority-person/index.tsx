import React, { PureComponent } from 'react'
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
import { Person } from './data.d'
import { Role } from '@/pages/authority/authority-role/data'
import { SetMethod } from '@/utils/axios'

import { setPerson, getPersonDetail } from './service'
import { setRole } from '@/pages/authority/authority-role/service'


import PersonTable from './components/table'
import PersonForm from './components/from'
import styles from './style.less'

interface PersonProps {
  loading: boolean
}

interface PersonState {
  roleList: Role[],
  authority: string,
  personList: Person[],
  actionTag: Person,
  drawerVisible: boolean,
  actionType: 'add' | 'edit' | 'delete' | null,
  pageIndex: number,
  pageSize: number,
  dataTotal: number,
  getListLoading: boolean,
  upDataLoading: boolean
}

// 因为loading 导致每次请求后引发页面更新
@connect(({ loading, }: ConnectState) => ({
  loading: loading.effects['role/getRoleList']
}),
)
class AuthorityPerson extends PureComponent<PersonProps, PersonState>{
  state: PersonState = {
    roleList: [],
    authority: '',
    personList: [],
    actionTag: {}, // 当前表单内容
    drawerVisible: false, // 是否打开表单
    actionType: null, // 点击按钮操作的类型
    pageIndex: 1, // 分页
    pageSize: 8,//
    dataTotal: 0,
    getListLoading: false,
    upDataLoading: false
  }

  constructor(props: PersonProps) {
    super(props)
    const authority = getAuthority()
    this.state.authority = typeof authority === 'string' ? authority : authority[0]

  }

  componentDidMount() {
    this.getRoleList()
    this.getPersonList()
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
          pageIndex, pageSize
        }, method: SetMethod['get']
      })
      this.setState({
        personList: res.data.elements,
        dataTotal: res.data.totalElements,
        getListLoading: false
      })
    } catch (e) {
      console.log(e)
      notification.error({
        description: e.errorMsg,
        message: formatMessage({ id: 'component.error' }),
      });
    }
  }

  // 获取权限数组
  getRoleList = async () => {
    try {
      const res = await setRole({ data: {}, method: SetMethod['get'] })
      this.setState({
        roleList: res.data
      })
    } catch (e) {
      console.log(e)
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
    const { personList } = this.state
    const oldPersonList = lodash.cloneDeep(personList)
    try {
      this.setState({
        upDataLoading: true
      })
      const res = await setPerson({ data: { userId: row.id }, method: SetMethod['delete'] })
      for (let i = 0; i < oldPersonList.length; i++) {
        if (oldPersonList[i].id === res.data as number) {
          oldPersonList.splice(i, 1)
          break
        }
      }
      this.setState({
        personList: oldPersonList,
        upDataLoading: false
      })
      notification.success({
        description: res.errorMsg ? res.errorMsg : formatMessage({ id: 'component.actionSuccess' }),
        message: formatMessage({ id: 'component.success' }),
      });
    } catch (e) {
      notification.error({
        description: e.errorMsg,
        message: formatMessage({ id: 'component.error' }),
      });
    }
  }

  // 表单提交事件
  handleFormSubmit = async (form: Person) => {
    try {
      const { actionType, personList } = this.state
      const oldPersonList = lodash.cloneDeep(personList)
      let res: { data?: Person | number, errorMsg: string } = { errorMsg: formatMessage({ id: 'component.actionError' }) }, newPersonList: Person[] = []
      this.setState({
        upDataLoading: true
      })
      if (actionType === 'edit') {
        res = await setPerson({ data: form, method: SetMethod['edit'] })
        newPersonList = oldPersonList.map(item => {
          if (item.id === (res.data as Person).id) {
            return Object.assign({}, item, res.data)
          }
          return item
        })
      } else if (actionType === 'add') {
        res = await setPerson({ data: form, method: SetMethod['add'] })
        oldPersonList.push(res.data as Person)
        newPersonList = oldPersonList
      }
      this.setState({
        personList: newPersonList,
        upDataLoading: false
      })
      notification.success({
        description: res.errorMsg ? res.errorMsg : formatMessage({ id: 'component.actionSuccess' }),
        message: formatMessage({ id: 'component.success' }),
      });
      this.initActionTag()
    } catch (e) {
      notification.error({
        description: e.errorMsg ? e.errorMsg : formatMessage({ id: 'component.actionError' }),
        message: formatMessage({ id: 'component.error' }),
      });
    }
  }

  handleTableOnChange = async (page: number, pageSize?: number | undefined) => {
    this.setState({
      pageIndex: page
    })
    this.getPersonList()
  }

  render() {
    const { personList, roleList, pageIndex, pageSize, dataTotal, authority, actionType, actionTag, drawerVisible, upDataLoading, getListLoading } = this.state
    const { loading } = this.props
    return (
      <PageHeaderWrapper content={<FormattedMessage id="authority-person.header.description" />}>
        <Card loading={loading}>
          <Alert className={styles['authority-person-warning']} message={formatMessage({ id: 'authority-tree.warning' })} type="warning" />
          <div className={styles['authority-add-button']}>
            <Button size="large" type="primary" style={{ float: 'right' }} onClick={this.handleBtnClickAdd}>
              <FormattedMessage id='component.add'></FormattedMessage>
            </Button>
          </div>
          {
            personList.length > 0 ? (<div>
              <PersonTable
                dataTotal={dataTotal}
                pageIndex={pageIndex}
                pageSize={pageSize}
                authority={authority}
                personList={personList}
                roleList={roleList}
                upDataLoading={upDataLoading}
                getListLoading={getListLoading}
                handleBtnClickEdit={this.handleBtnClickEdit}
                handleBtnClickDeleteUpData={this.handleBtnClickDeleteUpData}
                handleTableOnChange={this.handleTableOnChange}
              />
            </div>) : <Empty description={false} />
          }
        </Card>
        <Drawer
          title={`${actionType ? formatMessage({ id: 'authority-person.table.' + actionType }) : ''} ${actionTag.username || ''}`}
          placement="right"
          width={720}
          closable={false}
          maskClosable={false}
          onClose={this.initActionTag}
          visible={drawerVisible}
        >
          {drawerVisible ? <PersonForm actionTag={actionTag} roleList={roleList} upDataLoading={upDataLoading} onClose={this.initActionTag} onSubmit={this.handleFormSubmit} /> : null}
        </Drawer>
      </PageHeaderWrapper>
    )
  }
}

export default AuthorityPerson