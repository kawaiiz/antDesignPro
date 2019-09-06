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
const { SHOW_ALL } = TreeSelect;
import { Role } from '../data.d'

interface RoleFormState {
  loading: boolean,
  actionTag: Role,
  tree?: TreeCreate[], // 下拉框内数据
  newActionTag: NewActionTag
}

interface TreeCreate {
  title?: string,
  value: string,
  key: string,
  Children?: TreeCreate[] | null
}

interface RoleFormProp extends FormComponentProps {
  actionTag: Role,
  allAuthList: [],
  originalAuthList: IRoute[],
  onClose: () => void,
  onSubmit: (from: Role) => void
}

interface NewTreeValue { label: string, value: any }
interface NewActionTag extends Role {
  newAuth?: NewTreeValue[] | null
}

class RoleForm extends Component<RoleFormProp, RoleFormState>{
  state: RoleFormState = {
    loading: false,
    actionTag: {
      id: null,
      name: '',
      auth: []
    },
    newActionTag: {}
  }
  constructor(props: RoleFormProp) {
    super(props)
    const { actionTag } = this.state
    let newActionTag: NewActionTag = {
      newAuth: null
    }
    newActionTag = Object.assign(newActionTag, actionTag, props.actionTag)
    newActionTag.newAuth = this.createTreeValue()
    this.state.newActionTag = newActionTag
    this.createTree()
  }

  // 将要修改的auth字段的number[] 变成 {label:string,value:number}[]
  createTreeValue = () => {
    const { originalAuthList, actionTag } = this.props
    const { auth } = actionTag
    return auth!.map(item => {
      for (let i = 0; i < originalAuthList.length; i++) {
        if (originalAuthList[i].id === item) {
          return { label: originalAuthList[i].name, value: originalAuthList[i].id }
        }
      }
      return { label: null, value: null }
    })
  }

  createTree = () => {
    const { allAuthList } = this.props;
    function _create(allAuthList: IRoute[]): TreeCreate[] {
      return allAuthList.map((item, index) => ({
        title: item.name,
        value: item.id,
        key: item.id,
        children: item.children && item.children.length > 0 ? _create(item.children) : null,
      }))
    }
    this.state.tree = _create(allAuthList)
  }

  handleSubmit = () => {
    const { form, onSubmit, actionTag } = this.props;
    form.validateFields(err => {
      if (!err) {
        let formData: NewActionTag = { ...form.getFieldsValue(), id: actionTag.id, auth: [] }
        formData.auth = (formData.newAuth as NewTreeValue[]).map(item => item.value)
        onSubmit(formData)
      }
    })
  }

  render() {
    const { loading, newActionTag, tree } = this.state
    console.log(tree)
    const { form, onClose } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="vertical" onSubmit={this.handleSubmit}>
        <Form.Item label="name">
          {getFieldDecorator('name', {
            initialValue: newActionTag.name,
            rules: [{ required: true, message: 'Please input the name of collection!' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="newAuth">
          {getFieldDecorator('newAuth', {
            initialValue: newActionTag.newAuth
          })(
            <TreeSelect
              style={{ width: 300 }}
              allowClear={true}
              treeCheckable={true}
              treeCheckStrictly={true}
              showCheckedStrategy={SHOW_ALL}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={tree as unknown as TreeCreate[]}
              placeholder="Please select"
              treeDefaultExpandAll
            />
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

export default Form.create<RoleFormProp>()(RoleForm);