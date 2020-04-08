
import React, { useEffect, useState } from 'react';
import { toolAdd } from '@/utils/tools'
interface TableWidthSumProp {
  dataSource: any[],
  columns: any[],
  isSelect?: boolean,
  selectedRowSumList?: number[]
  rowKey?: string,
}
const TableWidthSum: React.FC<TableWidthSumProp> = (props) => {
  const { dataSource, columns, isSelect, selectedRowSumList, rowKey } = props;

  const [columCenter, setColumCenter] = useState<any[]>([])

  const setColumCenterValue = (colum: any) => {
    try {
      if (colum.footerContent) return <div style={isSelect ? { transform: 'translateX(-50px)' } : {}}>{colum.footerContent}</div>
      else if (colum.footerSum) {
        if (isSelect && selectedRowSumList) {
          return dataSource.reduce((sum, record) => {
            if (selectedRowSumList.some(item => item === record[rowKey!].toString())) {
              return toolAdd(sum, (typeof record[colum.key] === 'string' ? parseFloat(record[colum.key] || '0') : (typeof record[colum.key] === 'number' ? record[colum.key] : 0)))
            } else {
              return toolAdd(sum, 0)
            }
          }, 0)
        } else {
          return dataSource.reduce((sum, record) => toolAdd(sum, (typeof record[colum.key] === 'string' ? parseFloat(record[colum.key] || '0') : (typeof record[colum.key] === 'number' ? record[colum.key] : 0))), 0)
        }
      } else return ' '
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    const columCenter = columns.map(colum => setColumCenterValue(colum))
    setColumCenter(columCenter)
  }, [dataSource, columns])

  return (
    <div style={{ paddingLeft: isSelect ? 50 : 0 }}>
      <table className="ant-table">
        <colgroup>
          {columns.map((colModel, index) => {
            return <col style={{
              width: colModel.width,
              minWidth: colModel.width,
            }} key={index} />
          })}
        </colgroup>
        <tfoot >
          <tr >
            {columns.map((colum, idxCol) => {
              return <td style={{ padding: "0px 8px", borderRight: '1px solid #e8e8e8', textAlign: 'center' }} className={`${colum.className} table-width-sun-font`} key={idxCol}>
                <strong>
                  {columCenter[idxCol]}
                </strong>
              </td>
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default TableWidthSum;