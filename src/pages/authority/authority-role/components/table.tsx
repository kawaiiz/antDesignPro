import React from 'react'
import {
  Table,
  Button,
  Popconfirm
} from 'antd';
const ButtonGroup = Button.Group;
import { formatMessage } from 'umi-plugin-react/locale';
import { Role } from '../data.d'
import { getResourcesAuthById } from '@/utils/utils'


interface RoleTableProp {
  roleList: Role[],
  authority: string,
  getListLoading: boolean,
  handleBtnClickEdit: (role: Role) => void,
  handleBtnClickDeleteUpData: (role: Role) => void,
}

const RoleTable: React.FC<RoleTableProp> = (props) => {
  const { roleList, handleBtnClickDeleteUpData, handleBtnClickEdit, getListLoading, } = props
  const columns = [
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

        return (
          <ButtonGroup>
            {
              getResourcesAuthById(10) && <Button onClick={() => handleBtnClickEdit(record)}>
                {formatMessage({ id: 'authority-role.table.edit' })}
              </Button> 
            }
            {
              getResourcesAuthById(11) &&<Popconfirm
                title={`${formatMessage({ id: 'authority-role.table.delete' })} ${record.roleName}?`}
                okText={formatMessage({ id: 'component.confirm' })}
                cancelText={formatMessage({ id: 'component.cancel' })}
                onConfirm={() => handleBtnClickDeleteUpData(record)}>
                <Button type="danger">{formatMessage({ id: 'authority-role.table.delete' })}</Button>
              </Popconfirm> 
            }

          </ButtonGroup >
        )
      }
    }
  ]

  return <Table
    loading={getListLoading}
    rowKey={record => `${record.roleId}rowKey`}
    pagination={false}
    defaultExpandAllRows={true}
    columns={columns}
    dataSource={roleList} />
}


export default RoleTable

