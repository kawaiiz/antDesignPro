import React from 'react'
import { ResourcesTag } from '../data'

import {
  Table,
  Icon,
  Button,
  Popconfirm
} from 'antd';
const ButtonGroup = Button.Group;
import { formatMessage } from 'umi-plugin-react/locale';
import { MyConfig } from 'config'

interface TreeTableProp {
  authority: string[],
  resourcesList: ResourcesTag[],
  pageSize: number,
  pageIndex: number,
  dataTotal: number,
  getListLoading: boolean,
  upDataLoading: boolean,
  handleBtnClickEdit: (resources: ResourcesTag) => void,
  handleBtnClickDeleteUpData: (resources: ResourcesTag) => void,
  handleTableOnChange: (page: number, pageSize?: number | undefined) => void,
}

const TreeTable: React.FC<TreeTableProp> = (props) => {
  const { authority, resourcesList, pageSize, pageIndex, dataTotal, getListLoading, upDataLoading, handleTableOnChange, handleBtnClickDeleteUpData, handleBtnClickEdit } = props
  const columns = [

    {
      title: formatMessage({ id: 'authority-resources.table.name' }),
      dataIndex: 'resourceName',
      key: 'resourceName',
      width: '30%',
    },
    {
      title: formatMessage({ id: 'authority-resources.table.id' }),
      dataIndex: 'id',
      key: 'id',
      width: '10%',
    },
    {
      title: formatMessage({ id: 'authority-resources.table.path' }),
      dataIndex: 'resourceUrl',
      key: 'resourceUrl',
      width: '30%',
    },
    {
      title: formatMessage({ id: 'authority-resources.table.operation' }),
      dataIndex: 'operation',
      key: 'operation',
      width: '10%',
    },
    {
      title: formatMessage({ id: 'authority-resources.table.operation' }),
      key: 'action',
      render: (text: ResourcesTag, record: ResourcesTag, index: number) => {
        return (
          <ButtonGroup>
            {
              authority.includes(MyConfig.SUPER_ADMIN) && (
                <>
                  <Button onClick={() => handleBtnClickEdit(record)}>
                    {formatMessage({ id: 'authority-resources.table.edit' })}
                  </Button>
                  <Popconfirm
                    title={`${formatMessage({ id: 'authority-resources.table.delete' })} ${record.resourceName}?`}
                    okText={formatMessage({ id: 'component.confirm' })}
                    cancelText={formatMessage({ id: 'component.cancel' })}
                    onConfirm={() => handleBtnClickDeleteUpData(record)}>
                    <Button type="danger">{formatMessage({ id: 'authority-resources.table.delete' })}</Button>
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

    rowKey={record => `${record.id}rowKey`}
    pagination={{ current: pageIndex, pageSize: pageSize, total: dataTotal, onChange: handleTableOnChange }}
    columns={columns}
    dataSource={resourcesList}
  />
}

export default TreeTable