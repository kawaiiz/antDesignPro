import React, { Component } from 'react'
import {
  Table,
  Avatar,
  Button,
  Popconfirm
} from 'antd';
const ButtonGroup = Button.Group;
import { formatMessage } from 'umi-plugin-react/locale';
import { Person } from '../data.d'
import { Role } from '@/pages/authority/authority-role/data'

interface PersonTableProp {
  personList: Person[],
  roleList: Role[],
  authority: string,
  pageSize: number,
  pageIndex: number,
  dataTotal: number,
  getListLoading: boolean,
  upDataLoading: boolean,
  handleBtnClickEdit: (person: Person) => void,
  handleBtnClickDeleteUpData: (person: Person) => void,
  handleTableOnChange: (page: number, pageSize?: number | undefined) => void,
}

const PersonTable: React.FC<PersonTableProp> = (props) => {
  const { personList, pageSize, pageIndex, dataTotal, getListLoading, upDataLoading, handleTableOnChange, handleBtnClickDeleteUpData, handleBtnClickEdit } = props
  const columns = [
    {
      title: formatMessage({ id: 'authority-person.table.id' }),
      dataIndex: 'id',
      key: 'id',
      // render: (text: Person, record: Person, index: number) => {
      //   return formatMessage({ id: `menu.${record.name}` })
      // }
    },
    {
      title: formatMessage({ id: 'authority-person.table.name' }),
      dataIndex: 'username',
      key: 'username',
      // width: '15%',
      // render: (text: Person, record: Person, index: number) => {
      //   return formatMessage({ id: `authority-role.table.${record.name}` })
      // }
    },
    {
      title: formatMessage({ id: 'authority-person.table.role' }),
      dataIndex: 'roles',
      key: 'roles',
      // width: '15%',
      render: (text: Person, record: Person, index: number) => {
        return Array.isArray(record.roles) && record.roles.length > 0 ? record.roles![0].roleName : ''
      }
    },
    {
      title: formatMessage({ id: 'authority-person.table.phone' }),
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      // width: '15%',
      // render: (text: Person, record: Person, index: number) => {
      //   return formatMessage({ id: `authority-role.table.${record.name}` })
      // }
    },
    {
      title: formatMessage({ id: 'authority-person.table.icon' }),
      dataIndex: 'iconUrl',
      key: 'iconUrl',
      // width: '15%',
      render: (text: Person, record: Person, index: number) => (<Avatar src={record.iconUrl} />)
    },
    {
      title: formatMessage({ id: 'authority-person.table.operation' }),
      key: 'action',
      width: '20%',
      render: (text: Person, record: Person, index: number) => {

        return (
          <ButtonGroup>
            <Button onClick={() => handleBtnClickEdit(record)}>
              {formatMessage({ id: 'authority-person.table.edit' })}
            </Button>
            <Popconfirm
              title={`${formatMessage({ id: 'authority-person.table.delete' })} ${record.username}?`}
              okText={formatMessage({ id: 'component.confirm' })}
              cancelText={formatMessage({ id: 'component.cancel' })}
              onConfirm={() => handleBtnClickDeleteUpData(record)}>
              <Button type="danger" loading={upDataLoading} disabled={upDataLoading}>{formatMessage({ id: 'authority-person.table.delete' })}</Button>
            </Popconfirm>
          </ButtonGroup >
        )
      }
    }
  ]
  return <Table
    loading={getListLoading}
    rowKey={record => `${record.id}rowKey`}
    pagination={{ current: pageIndex, pageSize: pageSize, total: dataTotal, onChange: handleTableOnChange }}
    defaultExpandAllRows={true}
    columns={columns}
    dataSource={personList} />
}

export default PersonTable