import React, { Component } from 'react'
import { IRoute } from 'umi-types/config'
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
  actionTag: IRoute,
  tree?: TreeCreate[], // 下拉框内数据
}

interface TreeCreate {
  title?: string,
  value: string,
  key: string,
  Children?: TreeCreate[] | null
}

interface TreeFormProp extends FormComponentProps {
  actionTag: IRoute,
  authList: IRoute[],
  onClose: () => void,
  onSubmit: (from: IRoute) => void
}



class TreeForm extends Component<TreeFormProp, TreeFormState> {
  state: TreeFormState = {
    loading: false,
    actionTag: {
      id: '',
      parentId: '',
      name: '',
      path: '',
      component: '',
      icon: ' ',
      authority: [],
      hideInMenu: null
    },
  }

  constructor(props: TreeFormProp) {
    super(props)
    const { actionTag } = this.state
    this.state.actionTag = Object.assign(actionTag, props.actionTag)
    this.createTree()
  }

  // 构建表单下拉框里禁止点击的树型数据
  createTree = () => {
    const { authList } = this.props;
    const { actionTag } = this.state;
    function _create(authList: IRoute[], disabled: boolean): TreeCreate[] {
      return authList.map((item, index) => ({
        title: item.name,
        value: item.id,
        key: item.id,
        children: item.children && item.children.length > 0 ? _create(item.children, item.id === actionTag.parentId) : null,
        disabled: disabled || item.id === actionTag.parentId
      }))
    }
    this.state.tree = _create(authList, false)
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
    const { loading, actionTag, tree } = this.state
    const { form, onClose } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form layout="vertical">
        <Form.Item label={formatMessage({ id: 'authority-tree.table.name' })}>
          {getFieldDecorator('resourceName', {
            initialValue: actionTag.name,
            rules: [{ required: true, message: 'Please input the name of collection!' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage({ id: 'authority-tree.table.path' })}>
          {getFieldDecorator('resourceUrl', {
            initialValue: actionTag.path,
            rules: [{ required: true, message: 'Please input the name of collection!' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage({ id: 'authority-tree.table.operation' })}>
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
        <Form.Item label={formatMessage({ id: 'authority-tree.table.parentId' })}>
          {getFieldDecorator('pid', {
            initialValue: actionTag.parentId
          })(
            <TreeSelect
              // style={{ width: 300 }}
              allowClear={true}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={tree as unknown as TreeCreate[]}
              placeholder="Please select"
              treeDefaultExpandAll
            />
          )}
        </Form.Item>
        <Form.Item label={formatMessage({ id: 'authority-tree.table.component' })}>
          {getFieldDecorator('component', {
            initialValue: actionTag.component,
          })(<Input type="component" />)}
        </Form.Item>
        <Form.Item label={formatMessage({ id: 'authority-tree.table.icon' })}>
          {getFieldDecorator('icon', {
            initialValue: actionTag.icon,
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage({ id: 'authority-tree.table.type' })}>
          {getFieldDecorator('resourceType', {
            initialValue: actionTag.type,
          })(
            <Radio.Group>
              <Radio value="PAGE"><FormattedMessage id="authority-tree.form.page" /></Radio>
              <Radio value="INTERFACE"><FormattedMessage id="authority-tree.form.api" /></Radio>
            </Radio.Group>,
          )}
        </Form.Item>
        <Form.Item label={formatMessage({ id: 'authority-tree.table.hideInMenu' })}>
          {getFieldDecorator('hideInMenu', {
            initialValue: actionTag.hideInMenu,
          })(
            <Radio.Group>
              <Radio value={true}><FormattedMessage id="authority-tree.form.hide" /></Radio>
              <Radio value={false}><FormattedMessage id="authority-tree.form.show" /></Radio>
            </Radio.Group>,
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