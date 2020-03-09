import React from 'react'
import {
  Table,
  Icon,
  Button,
  Popconfirm
} from 'antd';
const ButtonGroup = Button.Group;
import { formatMessage } from 'umi-plugin-react/locale';
import { Auth } from '../data.d'
import { MyConfig } from 'config';

interface AuthTableProp {
  authList: Auth[],
  authority: string[],
  getListLoading: boolean,
  upDataLoading: boolean,
  handleBtnClickEdit: (person: Auth) => void,
  handleBtnClickDeleteUpData: (person: Auth) => void,
}

const AuthTable: React.FC<AuthTableProp> = (props) => {
  const { getListLoading, upDataLoading, handleBtnClickDeleteUpData, handleBtnClickEdit, authList, authority } = props
  const columns = [
    {
      title: formatMessage({ id: 'authority-auth.table.htmlId' }),
      dataIndex: 'htmlId',
      key: 'htmlId',
      // render: (text: Auth, record: Auth, index: number) => {
      //   return formatMessage({ id: `menu.${record.name}` })
      // }
    },
    {
      title: formatMessage({ id: 'authority-auth.table.htmlName' }),
      dataIndex: 'htmlName',
      key: 'htmlName',
      // width: '15%',
      // render: (text: Auth, record: Auth, index: number) => {
      //   return formatMessage({ id: `authority-role.table.${record.name}` })
      // }
    },
    {
      title: formatMessage({ id: 'authority-auth.table.htmlType' }),
      dataIndex: 'htmlType',
      key: 'htmlType',
      // width: '15%',
      // render: (text: Auth, record: Auth, index: number) => {
      //   return formatMessage({ id: `authority-role.table.${record.name}` })
      // }
    },
    {
      title: formatMessage({ id: 'authority-auth.table.htmlAddr' }),
      dataIndex: 'htmlAddr',
      key: 'htmlAddr',
      // width: '15%',
      // render: (text: Auth, record: Auth, index: number) => {
      //   return formatMessage({ id: `authority-role.table.${record.name}` })
      // }
    },
    {
      title: formatMessage({ id: 'authority-auth.table.iconUrl' }),
      dataIndex: 'iconUrl',
      key: 'iconUrl',
      // width: '15%', 
      render: (text: Auth, record: Auth, index: number) => (record.iconUrl ? <Icon type={record.iconUrl} /> : '')
    },
    {
      title: formatMessage({ id: 'authority-auth.table.operation' }),
      key: 'action',
      width: '25%',
      render: (text: Auth, record: Auth, index: number) => {

        return (
          <ButtonGroup>
            {
              authority.includes(MyConfig.SUPER_ADMIN) && (
                <>
                  <Button onClick={() => handleBtnClickEdit(record)}>
                    {formatMessage({ id: 'authority-auth.table.edit' })}
                  </Button>
                  <Popconfirm
                    title={`${formatMessage({ id: 'authority-auth.table.delete' })} ${record.htmlName}?`}
                    okText={formatMessage({ id: 'component.confirm' })}
                    cancelText={formatMessage({ id: 'component.cancel' })}
                    onConfirm={() => handleBtnClickDeleteUpData(record)}>
                    <Button type="danger" loading={upDataLoading} disabled={upDataLoading}>{formatMessage({ id: 'authority-auth.table.delete' })}</Button>
                  </Popconfirm>
                </>
              )
            }
          </ButtonGroup >
        )
      }
    }
  ]
  return <Table
    loading={getListLoading}
    rowKey={record => `${record.htmlId}rowKey`}
    pagination={false}
    defaultExpandAllRows={true}
    // defaultExpandAllRows={false}
    columns={columns}
    dataSource={authList} />
}

export default AuthTable