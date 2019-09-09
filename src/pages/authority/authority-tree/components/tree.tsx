import React, { Component } from 'react'
import { IRoute } from 'umi-types/config'
import {
  Table,
  Icon,
  Button,
  Popconfirm
} from 'antd';
const ButtonGroup = Button.Group;
import { formatMessage } from 'umi-plugin-react/locale';

import { toTree } from '@/models/auth'

interface TreeTableProp {
  originalAuthList: IRoute[],
  authority: string,
  handleBtnClickEdit: (auth: IRoute) => void,
  handleBtnClickDeleteUpData: (auth: IRoute) => void,
}

interface TreeTableState {

}

class TreeTable extends Component<TreeTableProp, TreeTableState> {
  state = {
    columns: [
      {
        title: formatMessage({ id: 'authority-tree.table.name' }),
        dataIndex: 'name',
        key: 'name',
        // render: (text: IRoute, record: IRoute, index: number) => {
        //   return formatMessage({ id: `menu.${record.name}` })
        // }
      },
      {
        title: formatMessage({ id: 'authority-tree.table.type' }),
        dataIndex: 'type',
        key: 'type',
        width: '15%',
        render: (text: IRoute, record: IRoute, index: number) => {
          return formatMessage({ id: `authority-tree.table.${record.type}` })
        }
      },
      {
        title: formatMessage({ id: 'authority-tree.table.path' }),
        dataIndex: 'path',
        key: 'path',
        width: '15%',
      },
      {
        title: formatMessage({ id: 'authority-tree.table.icon' }),
        dataIndex: 'icon',
        key: 'icon',
        width: '15%',
        render: (icon: string = ' ') => {
          icon = icon.length > 0 ? icon : ' '
          return <Icon type={icon} />
        }
      },
      {
        title: formatMessage({ id: 'authority-tree.table.operation' }),
        key: 'action',
        width: '20%',
        render: (text: IRoute, record: IRoute, index: number) => {
          const { handleBtnClickDeleteUpData, handleBtnClickEdit } = this.props
          return (
            <ButtonGroup>
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
            </ButtonGroup >
          )
        }
      }
    ],
  }

  render() {
    const { columns } = this.state
    const { originalAuthList } = this.props

    return <Table
      rowKey={record => `${record.id}rowKey`}
      pagination={false}
      defaultExpandAllRows={true}
      columns={columns}
      dataSource={toTree(originalAuthList)} />
  }
}

export default TreeTable