import React, { Component } from 'react'
import {
  Table,
  Icon,
  Button,
  Popconfirm
} from 'antd';
const ButtonGroup = Button.Group;
import { formatMessage } from 'umi-plugin-react/locale';
import { Person } from '../data.d'

interface PersonTableProp {
  personList: Person[],
  authority: string,
  pageSize: number,
  pageIndex: number,
  dataTotal: number,
  handleBtnClickEdit: (person: Person) => void,
  handleBtnClickDeleteUpData: (person: Person) => void,
}

const PersonTable: React.FC<PersonTableProp> = (props) => {
  const { personList, pageSize, pageIndex, dataTotal } = props
  const columns = [
    {
      title: formatMessage({ id: 'authority-person.table.id' }),
      dataIndex: 'id',
      key: 'id',
      // render: (text: IRoute, record: IRoute, index: number) => {
      //   return formatMessage({ id: `menu.${record.name}` })
      // }
    },
    {
      title: formatMessage({ id: 'authority-person.table.name' }),
      dataIndex: 'username',
      key: 'username',
      // width: '15%',
      // render: (text: Role, record: Role, index: number) => {
      //   return formatMessage({ id: `authority-role.table.${record.name}` })
      // }
    },
    {
      title: formatMessage({ id: 'authority-person.table.phone' }),
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      // width: '15%',
      // render: (text: Role, record: Role, index: number) => {
      //   return formatMessage({ id: `authority-role.table.${record.name}` })
      // }
    },
    {
      title: formatMessage({ id: 'authority-person.table.icon' }),
      dataIndex: 'iconUrl',
      key: 'iconUrl',
      // width: '15%',
      // render: (text: Role, record: Role, index: number) => {
      //   return formatMessage({ id: `authority-role.table.${record.name}` })
      // }
    },
    {
      title: formatMessage({ id: 'authority-person.table.operation' }),
      key: 'action',
      width: '20%',
      render: (text: Person, record: Person, index: number) => {
        const { handleBtnClickDeleteUpData, handleBtnClickEdit } = props
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
              <Button type="danger">{formatMessage({ id: 'authority-person.table.delete' })}</Button>
            </Popconfirm>
          </ButtonGroup >
        )
      }
    }
  ]
  return <Table
    rowKey={record => `${record.roleId}rowKey`}
    pagination={{ current: pageIndex, pageSize: pageSize, simple: true, total: dataTotal, }}
    defaultExpandAllRows={true}
    columns={columns}
    dataSource={personList} />
}

export default PersonTable