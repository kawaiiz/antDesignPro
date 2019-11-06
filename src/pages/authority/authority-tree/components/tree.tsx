import React from 'react'
import { IRoute } from 'umi-types/config'
import {
  Table,
  Icon,
  Button,
  Popconfirm
} from 'antd';
const ButtonGroup = Button.Group;
import { formatMessage } from 'umi-plugin-react/locale';
import { getResourcesAuthById } from '@/utils/utils'
import { MyConfig } from 'config'

import { toTree } from '@/models/auth'

interface TreeTableProp {
  originalAuthList: IRoute[],
  authority: string,
  handleBtnClickEdit: (auth: IRoute) => void,
  handleBtnClickDeleteUpData: (auth: IRoute) => void,
}

const TreeTable: React.FC<TreeTableProp> = (props) => {
  const { originalAuthList, handleBtnClickDeleteUpData, handleBtnClickEdit, authority } = props
  const columns = [

    {
      title: formatMessage({ id: 'authority-tree.table.name' }),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: formatMessage({ id: 'authority-tree.table.name' }),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: formatMessage({ id: 'authority-tree.table.path' }),
      dataIndex: 'path',
      key: 'path',
      width: '20%',
    },
    {
      title: formatMessage({ id: 'authority-tree.table.type' }),
      dataIndex: 'type',
      key: 'type',
      width: '10%',
    },
    {
      title: formatMessage({ id: 'authority-tree.table.operation' }),
      dataIndex: 'operation',
      key: 'operation',
      width: '10%',
    },
    {
      title: formatMessage({ id: 'authority-tree.table.icon' }),
      dataIndex: 'icon',
      key: 'icon',
      width: '10%',
      render: (icon: string = ' ') => {
        icon = icon.length > 0 ? icon : ' '
        return <Icon type={icon} />
      }
    },
    {
      title: formatMessage({ id: 'authority-tree.table.operation' }),
      key: 'action',
      width: '15%',
      render: (text: IRoute, record: IRoute, index: number) => {
        return (
          <ButtonGroup>
            {/* {
              getResourcesAuthById(7) && <Button onClick={() => handleBtnClickEdit(record)}>
                {formatMessage({ id: 'authority-tree.table.edit' })}
              </Button> 
            }
            {
              getResourcesAuthById(8) && <Popconfirm
                title={`${formatMessage({ id: 'authority-tree.table.delete' })} ${record.name}?`}
                okText={formatMessage({ id: 'component.confirm' })}
                cancelText={formatMessage({ id: 'component.cancel' })}
                onConfirm={() => handleBtnClickDeleteUpData(record)}>
                <Button type="danger">{formatMessage({ id: 'authority-tree.table.delete' })}</Button>
              </Popconfirm> 
            } */}
            {
              authority === MyConfig.SUPER_ADMIN && (
                <>
                  <Button onClick={() => handleBtnClickEdit(record)}>
                    {formatMessage({ id: 'authority-tree.table.edit' })}
                  </Button>
                  <Popconfirm
                    title={`${formatMessage({ id: 'authority-tree.table.delete' })} ${record.name}?`}
                    okText={formatMessage({ id: 'component.confirm' })}
                    cancelText={formatMessage({ id: 'component.cancel' })}
                    onConfirm={() => handleBtnClickDeleteUpData(record)}>
                    <Button type="danger">{formatMessage({ id: 'authority-tree.table.delete' })}</Button>
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
    rowKey={record => `${record.id}rowKey`}
    pagination={false}
    // defaultExpandAllRows={true}
    defaultExpandAllRows={false}
    columns={columns}
    dataSource={toTree(originalAuthList)} />
}

export default TreeTable