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
} from 'antd'


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
        onSubmit({ ...form.getFieldsValue(), id: actionTag.id })
      }
    })
  }

  render() {
    const { loading, actionTag, tree } = this.state
    const { form, onClose } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form layout="vertical" onSubmit={this.handleSubmit}>
        <Form.Item label="name">
          {getFieldDecorator('name', {
            initialValue: actionTag.name,
            rules: [{ required: true, message: 'Please input the name of collection!' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="path">
          {getFieldDecorator('path', {
            initialValue: actionTag.path,
            rules: [{ required: true, message: 'Please input the name of collection!' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="parentId">
          {getFieldDecorator('parentId', {
            initialValue: actionTag.parentId
          })(
            <TreeSelect
              style={{ width: 300 }}
              allowClear={true}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={tree as unknown as TreeCreate[]}
              placeholder="Please select"
              treeDefaultExpandAll
            />
          )}
        </Form.Item>
        <Form.Item label="component">
          {getFieldDecorator('component', {
            initialValue: actionTag.component,
          })(<Input type="component" />)}
        </Form.Item>
        <Form.Item label="icon">
          {getFieldDecorator('icon', {
            initialValue: actionTag.icon,
          })(<Input />)}
        </Form.Item>
        <Form.Item label="type">
          {getFieldDecorator('type', {
            initialValue: actionTag.type || false,
          })(
            <Radio.Group>
              <Radio value={'page'}><FormattedMessage id="authority-tree.form.page" /></Radio>
              <Radio value={'api'}><FormattedMessage id="authority-tree.form.api" /></Radio>
            </Radio.Group>,
          )}
        </Form.Item>
        <Form.Item label="hideInMenu">
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
            htmlType="submit"
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