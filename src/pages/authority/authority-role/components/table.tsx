import React, { Component } from 'react'
import {
  Table,
  Icon,
  Button,
  Popconfirm
} from 'antd';
const ButtonGroup = Button.Group;
import { formatMessage } from 'umi-plugin-react/locale';
import { Role } from '../data.d'
import { IRoute } from 'umi-types/config';

interface RoleTableProp {
  roleList: Role[],
  authority: string,
  handleBtnClickEdit: (role: Role) => void,
  handleBtnClickDeleteUpData: (role: Role) => void,
}

interface RoleTableState {

}

class RoleTable extends Component<RoleTableProp, RoleTableState> {

  state = {
    columns: [
      {
        title: formatMessage({ id: 'authority-role.table.id' }),
        dataIndex: 'roleId',
        key: 'roleId',
        // render: (text: IRoute, record: IRoute, index: number) => {
        //   return formatMessage({ id: `menu.${record.name}` })
        // }
      },
      {
        title: formatMessage({ id: 'authority-role.table.name' }),
        dataIndex: 'roleName',
        key: 'roleName',
        // width: '15%',
        // render: (text: Role, record: Role, index: number) => {
        //   return formatMessage({ id: `authority-role.table.${record.name}` })
        // }
      },
      {
        title: formatMessage({ id: 'authority-role.table.desc' }),
        dataIndex: 'roleDescription',
        key: 'roleDescription',
        // width: '15%',
        // render: (text: Role, record: Role, index: number) => {
        //   return formatMessage({ id: `authority-role.table.${record.name}` })
        // }
      },
      {
        title: formatMessage({ id: 'authority-role.table.operation' }),
        key: 'action',
        width: '20%',
        render: (text: Role, record: Role, index: number) => {
          const { handleBtnClickDeleteUpData, handleBtnClickEdit } = this.props
          return (
            <ButtonGroup>
              <Button onClick={() => handleBtnClickEdit(record)}>
                {formatMessage({ id: 'authority-role.table.edit' })}
              </Button>
              <Popconfirm
                title={`${formatMessage({ id: 'authority-role.table.delete' })} ${record.name}?`}
                okText={formatMessage({ id: 'component.confirm' })}
                cancelText={formatMessage({ id: 'component.cancel' })}
                onConfirm={() => handleBtnClickDeleteUpData(record)}>
                <Button type="danger">{formatMessage({ id: 'authority-role.table.delete' })}</Button>
              </Popconfirm>
            </ButtonGroup >
          )
        }
      }
    ],
  }


  render() {
    const { columns } = this.state
    const { roleList } = this.props

    return <Table
      rowKey={record => `${record.id}rowKey`}
      pagination={false}
      defaultExpandAllRows={true}
      columns={columns}
      dataSource={roleList} />
  }
}


export default RoleTable

