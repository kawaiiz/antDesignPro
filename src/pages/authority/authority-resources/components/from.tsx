import React, { Component } from 'react'
import { ResourcesTag } from '../data'

import { FormComponentProps } from 'antd/es/form';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import styles from '../style.less'
import {
  Form,
  Input,
  Radio,
  Button,
  TreeSelect,
  Select,
} from 'antd'

const { Option } = Select;
interface TreeFormState {
  loading: boolean,
  actionTag: ResourcesTag,
  tree?: TreeCreate[], // 下拉框内数据
}

interface TreeCreate {
  title?: string,
  value: string,
  key: string,
  Children?: TreeCreate[] | null
}

interface TreeFormProp extends FormComponentProps {
  actionTag: ResourcesTag,
  resourcesList: ResourcesTag[],
  onClose: () => void,
  onSubmit: (from: ResourcesTag) => void
}



class TreeForm extends Component<TreeFormProp, TreeFormState> {
  state: TreeFormState = {
    loading: false,
    actionTag: {
      id: undefined, // 资源id
      operation: '', // 请求方式
      resourceName: '', // 资源名
      resourceUrl: '', // 资源访问路径
    },
  }

  constructor(props: TreeFormProp) {
    super(props)
    const { actionTag } = this.state
    this.state.actionTag = Object.assign(actionTag, props.actionTag)
  }


  handleSubmit = () => {
    const { form, onSubmit, actionTag } = this.props;
    form.validateFields(err => {
      if (!err) {
        onSubmit({ ...form.getFieldsValue(), resourceId: actionTag.id })
      }
    })
  }

  render() {
    const { loading, actionTag } = this.state
    const { form, onClose } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form layout="vertical">
        <Form.Item label={formatMessage({ id: 'authority-resources.table.name' })}>
          {getFieldDecorator('resourceName', {
            initialValue: actionTag.resourceName,
            rules: [{ required: true, message: 'Please input the name of collection!' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage({ id: 'authority-resources.table.path' })}>
          {getFieldDecorator('resourceUrl', {
            initialValue: actionTag.resourceUrl,
            rules: [{ required: true, message: 'Please input the name of collection!' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage({ id: 'authority-resources.table.operation' })}>
          {getFieldDecorator('operation', {
            initialValue: actionTag.operation,
            rules: [{ required: true, message: 'Please select RequestType!' }],
          })(
            <Select placeholder="Please select a country">
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>,
          )}
        </Form.Item>
        <Form.Item>
          <Button
            size="large"
            loading={loading}
            className={styles['authority-from-button']}
            type="primary"
            onClick={this.handleSubmit}
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
}

export default Form.create<TreeFormProp>()(TreeForm);