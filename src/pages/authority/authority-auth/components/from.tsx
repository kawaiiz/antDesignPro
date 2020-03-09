import React, { useState, useEffect } from 'react'
import { FormComponentProps } from 'antd/es/form';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import styles from '../style.less'
import {
  Form,
  Input,
  Select,
  Button,
  TreeSelect,
  Spin,
  notification
} from 'antd'
const { Option } = Select

import { toTree } from '@/utils/utils'
import { Auth } from '../data.d'
import { MyConfig } from 'config'
import { ResourcesTag } from '@/pages/authority/authority-resources/data';
import { getAuthDetail } from '../service'

interface AuthFormProp extends FormComponentProps {
  resourcesList: ResourcesTag[],
  actionTag: Auth,
  actionType: 'add' | 'edit' | 'delete' | null,
  authList: Auth[],
  upDataLoading: boolean,
  onClose: () => void,
  onSubmit: (from: Auth) => void
}

interface TreeCreate {
  title?: string,
  value: string,
  key: string,
  disable?: boolean,
  Children?: TreeCreate[] | null
}


const AuthForm: React.FC<AuthFormProp> = (props) => {
  const { form, onClose, actionTag, actionType, onSubmit, upDataLoading, resourcesList, authList } = props;
  const { getFieldDecorator } = form;
  const [loading, setLoading] = useState(false)
  const [selectTree, setSelectTree] = useState<TreeCreate[]>([])
  const [tagDetail, setTagDetail] = useState<Auth>({ resources: [] })
  // 构建表单下拉框里禁止点击的树型数据
  const createTree = (authTree: Auth[]) => {
    function _create(authTree: Auth[], disabled: boolean): TreeCreate[] {
      return authTree.map((item, index) => ({
        title: item.htmlName,
        value: item.htmlId!.toString(),
        key: item.htmlId!.toString(),
        children: item.children && item.children.length > 0 ? _create(item.children, item.htmlId === actionTag.htmlId) : null,
        disabled: disabled || item.htmlId === actionTag.htmlId
      }))
    }
    setSelectTree(_create(authTree, false))
  }

  const getAuthDetailFunc = async () => {
    try {
      const res = await getAuthDetail({ htmlId: actionTag.htmlId! })
      setTagDetail(res.data)
    } catch (e) {
      console.log(e)
      notification.error({
        description: e.errorMsg,
        message: formatMessage({ id: 'component.error' }),
      });
    }
  }

  useEffect(() => {
    if (actionType === 'edit') {
      getAuthDetailFunc()
    }
    createTree(authList)
  }, [])


  const handleSubmit = () => {
    try {
      form.validateFields((err, value) => {
        if (!err) {
          let formData: Auth = { ...form.getFieldsValue(), htmlId: actionTag.htmlId }
          onSubmit(formData)
        } else {
          console.log(err)
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Form layout="vertical">
      <Spin spinning={loading}></Spin>
      <Form.Item label={formatMessage({ id: 'authority-auth.form.htmlName' })}>
        {getFieldDecorator('htmlName', {
          initialValue: tagDetail.htmlName,
          rules: [{ required: true, message: formatMessage({ id: 'authority-auth.form.rule.htmlName' }) }],
        })(<Input />)}
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'authority-auth.form.htmlType' })}>
        {getFieldDecorator('htmlType', {
          initialValue: tagDetail.htmlType,
          rules: [{ required: true, message: formatMessage({ id: 'authority-auth.form.rule.htmlType' }) }],
        })(
          <Select>
            <Option value="PAGE">PAGE</Option>
            <Option value="FUNC">FUNC</Option>
          </Select>,
        )}
      </Form.Item>

      <Form.Item label={formatMessage({ id: 'authority-auth.form.resourceIds' })} >
        {getFieldDecorator('resourceIds', {
          initialValue: tagDetail.resources!.map(item => item.id),
          // rules: [{ required: true, message: formatMessage({ id: 'authority-auth.form.rule.resourceIds' }) }],
        })(
          <Select mode="multiple">
            {
              resourcesList.map(item => <Option value={item.id} key={item.id}>{item.resourceName}</Option>)
            }
          </Select>,
        )}
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'authority-auth.form.parentId' })}>
        {getFieldDecorator('parentId', {
          initialValue: tagDetail.parentId ? tagDetail.parentId.toString() : null
        })(
          <TreeSelect
            // style={{ width: 300 }}
            allowClear={true}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            treeData={selectTree as unknown as TreeCreate[]}
          // placeholder="Please select"
          // treeDefaultExpandAll
          />
        )}
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'authority-auth.form.alias' })}>
        {getFieldDecorator('alias', {
          initialValue: tagDetail.alias,
        })(<Input />)}
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'authority-auth.form.htmlAddr' })}>
        {getFieldDecorator('htmlAddr', {
          initialValue: tagDetail.htmlAddr,
        })(<Input />)}
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'authority-auth.form.iconUrl' })}>
        {getFieldDecorator('iconUrl', {
          initialValue: tagDetail.iconUrl,
        })(<Input />)}
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'authority-auth.form.sortNum' })}>
        {getFieldDecorator('sortNum', {
          initialValue: tagDetail.sortNum,
        })(<Input />)}
      </Form.Item>

      <Form.Item>
        <Button
          size="large"
          loading={upDataLoading}
          disabled={upDataLoading}
          className={styles['authority-from-button']}
          type="primary"
          onClick={handleSubmit}
        >
          <FormattedMessage id="component.confirm" />
        </Button>
        <Button
          size="large"
          onClick={() => { onClose(); }}> <FormattedMessage id="component.cancel" /></Button>
      </Form.Item>
    </Form>
  )
}

export default Form.create<AuthFormProp>()(AuthForm);