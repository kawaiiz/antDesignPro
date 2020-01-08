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

import { SetMethod } from '@/utils/axios'
import { setResources } from './service'
import styles from './style.less'
import { ResourcesTag } from './data'

import TreeTable from './components/table'
import TreeForm from './components/from'
import { MyConfig } from 'config';

interface AuthState {
  authority: string,
  resourcesList: ResourcesTag[],
  actionTag: ResourcesTag,
  drawerVisible: boolean,
  actionType: 'add' | 'edit' | 'delete' | null,
  pageIndex: number,
  pageSize: number,
  dataTotal: number,
  getListLoading: boolean,
  upDataLoading: boolean,
}

interface Authprops {
  dispatch: Dispatch<any>,
  loading: boolean,
}

@connect(({ loading }: ConnectState) => ({
  loading: loading.effects['auth/getResourcesList'] || loading.effects['auth/upDataAuthList'],
}))
class AuthorityResources extends PureComponent<Authprops, AuthState> {
  state: AuthState = {
    authority: '',
    resourcesList: [],
    actionTag: {
      id: undefined, // 资源id
      operation: '', // 请求方式
      resourceName: '', // 资源名
      resourceUrl: '', // 资源访问路径
    }, // 当前表单内容
    drawerVisible: false, // 是否打开表单
    actionType: null, // 点击按钮操作的类型
    pageIndex: 1, // 分页
    pageSize: 6,//
    dataTotal: 0,
    getListLoading: false,
    upDataLoading: false,
  }

  constructor(props: Authprops) {
    super(props)
    const authority = getAuthority()
    this.state.authority = typeof authority === 'string' ? authority : authority[0]
  }

  componentDidMount() {
    this.getResourcesList()
  }


  // 获取 权限数组
  getResourcesList = async () => {
    try {
      const { pageIndex, pageSize } = this.state
      this.setState({
        getListLoading: true
      })
      const res = await setResources({
        data: {
          pageIndex: pageIndex - 1, pageSize
        }, method: SetMethod['get']
      })
      this.setState({
        resourcesList: res.data.elements,
        dataTotal: res.data.totalElements,
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
      actionTag: {
        id: undefined, // 资源id
        operation: '', // 请求方式
        resourceName: '', // 资源名
        resourceUrl: '', // 资源访问路径
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
  handleBtnClickEdit = (row: ResourcesTag) => {
    this.setState({
      actionTag: row,
      actionType: 'edit',
      drawerVisible: true
    })
  }

  // 点击删除浮窗的确认按钮
  handleBtnClickDeleteUpData = async (row: ResourcesTag) => {
    try {
      this.setState({
        upDataLoading: true
      })
      const res = await setResources({ data: { resourceId: row.id! }, method: SetMethod['delete'] })
      this.getResourcesList()
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
  handleFormSubmit = async (form: ResourcesTag) => {
    try {
      const { actionType } = this.state
      let res: { data?: ResourcesTag | number, errorMsg: string } = { errorMsg: formatMessage({ id: 'component.action-error' }) }
      this.setState({
        upDataLoading: true
      })
      if (actionType === 'edit') {
        res = await setResources({ data: form, method: SetMethod['edit'] })
        this.getResourcesList()
      } else if (actionType === 'add') {
        res = await setResources({ data: form, method: SetMethod['add'] })
        this.setState({
          pageIndex: 1
        }, this.getResourcesList)
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
    }, this.getResourcesList)
  }

  render() {
    const { authority, resourcesList, pageIndex, pageSize, dataTotal, actionType, actionTag, drawerVisible, upDataLoading, getListLoading } = this.state
    const { loading } = this.props
    return (<PageHeaderWrapper content={<FormattedMessage id="authority-resources.header.description" />}>
      <Card loading={loading}>
        <Alert className={styles['authority-resources-warning']} message={formatMessage({ id: 'authority-resources.warning' })} type="warning" />
        {
          authority === MyConfig.SUPER_ADMIN && <div className='box box-row-end btn-mb'>
            <Button size="large" type="primary" style={{ float: 'right' }} onClick={this.handleBtnClickAdd}>
              <FormattedMessage id='component.add'></FormattedMessage>
            </Button>
          </div>
        }
        <TreeTable
          authority={authority}
          resourcesList={resourcesList}
          dataTotal={dataTotal}
          pageIndex={pageIndex}
          pageSize={pageSize}
          upDataLoading={upDataLoading}
          getListLoading={getListLoading}
          handleBtnClickEdit={this.handleBtnClickEdit}
          handleBtnClickDeleteUpData={this.handleBtnClickDeleteUpData}
          handleTableOnChange={this.handleTableOnChange}
        />
      </Card>
      <Drawer
        title={`${actionType ? formatMessage({ id: 'authority-resources.table.' + actionType }) : ''} ${actionTag.resourceName}`}
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
          resourcesList={resourcesList}
          onClose={this.initActionTag}
          onSubmit={this.handleFormSubmit} />
      </Drawer>
    </PageHeaderWrapper >);
  }
}

export default AuthorityResources