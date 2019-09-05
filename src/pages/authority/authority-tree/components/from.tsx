import React, { Component, Children } from 'react'
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
  tree?: TreeCreate[],
  parentIndex?: number[]
}

interface TreeFormProp extends FormComponentProps {
  actionTag: IRoute,
  authList: IRoute[],
  onClose: () => void,
  onSubmit: (from: IRoute, parentIndex: number[]) => void
}

interface TreeCreate {
  title?: string,
  value: string,
  key: string,
  Children?: TreeCreate[] | null
}

class TreeForm extends Component<TreeFormProp> {
  state: TreeFormState = {
    loading: false,
    actionTag: {
      name: '',
      path: '',
      component: '',
      icon: ' ',
      authority: [],
      hideInMenu: false
    }
  }

  constructor(props: TreeFormProp) {
    super(props)
    const { actionTag } = this.state
    this.state.actionTag = Object.assign(actionTag, props.actionTag)
    this.state.parentIndex = actionTag.index.length > 0 ? actionTag.index.slice(0, actionTag.index.length - 1) : []
    this.createTree()
  }

  createTree = () => {
    const { authList } = this.props;
    const { actionTag } = this.state;
    function _create(authList: IRoute[], disabled: boolean): TreeCreate[] {
      return authList.map((item, index) => {
        const newItem = {
          title: item.path,
          value: item.index,
          key: item.index,
          children: item.children && item.children.length > 0 ? _create(item.children, item.index === actionTag.index) : null,
          disabled: disabled || item.index === actionTag.index
        }
        return newItem
      })
    }

    this.state.tree = _create(authList, false)
  }

  handleSubmit = () => {
    const { form, onSubmit } = this.props;
    const { parentIndex } = this.state;
    form.validateFields(err => {
      if (!err) {
        onSubmit(form.getFieldsValue(), parentIndex as number[])
      }
    })
  }

  handleChangeParentIndex = (val: any) => {
    this.setState({
      parentIndex: val
    })
  }

  render() {
    const { loading, actionTag, tree, parentIndex } = this.state
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
        <Form.Item label="parentNode">
          <TreeSelect
            style={{ width: 300 }}
            allowClear={true}
            value={parentIndex}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            treeData={tree as unknown as TreeCreate[]}
            placeholder="Please select"
            treeDefaultExpandAll
            onChange={this.handleChangeParentIndex}
          />
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
        {/* <Form.Item label="authority">
          {getFieldDecorator('authority', {
            initialValue: actionTag.authority,
          })(<Input />)}
        </Form.Item> */}
        <Form.Item label="hideInMenu">
          {getFieldDecorator('hideInMenu', {
            initialValue: actionTag.hideInMenu || false,
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