import React, { Component } from 'react'
import { IRoute } from 'umi-types/config'
import { FormComponentProps } from 'antd/es/form';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import styles from '../style.less'
import {
  Form,
  Input,
  Button,
  TreeSelect,
} from 'antd'
const { SHOW_ALL } = TreeSelect;

import { Auth } from '@/pages/authority/authority-auth/data'
import { Role } from '../data.d'

interface RoleFormState {
  tree?: TreeCreate[], // 下拉框内数据
}

interface TreeCreate {
  title?: string,
  value: string,
  key: string,
  Children?: TreeCreate[] | null
}

interface RoleFormProp extends FormComponentProps {
  actionTag: Role,
  actionType: 'add' | 'edit' | 'delete' | null,
  authList: Auth[],
  upDataLoading: boolean,
  onClose: () => void,
  onSubmit: (from: Role) => void
}

class RoleForm extends Component<RoleFormProp, RoleFormState>{
  state: RoleFormState = {}

  constructor(props: RoleFormProp) {
    super(props)
    const { actionTag } = props
    console.log(actionTag)

    this.createTree()
  }

  // 创建树形结构
  createTree = () => {
    const { authList } = this.props;
    console.log(authList)
    function _create(authList: IRoute[]): TreeCreate[] {
      let tree = []
      for (let i = 0; i < authList.length; i++) {
        // 如果是生产环境就跳过这两个页面
        if (process.env.NODE_ENV === 'production' && (authList[i].htmlId == 28 || authList[i].htmlId === 29)) continue;
        const newItem = {
          title: authList[i].htmlType === 'PAGE' ? formatMessage({ id: `menu.${authList[i].alias}`, defaultMessage: authList[i].alias }) + '页面' : authList[i].htmlName,
          value: authList[i].htmlId!.toString(),
          key: authList[i].htmlId!.toString(),
          children: authList[i].children && authList[i].children.length > 0 ? _create(authList[i].children) : null,
        }
        tree.push(newItem)
      }
      return tree
      // return authList.map((item, index) => ({
      //   title: item.htmlType === 'PAGE' ? formatMessage({ id: `menu.${item.alias}`, defaultMessage: item.alias }) + '页面' : item.htmlName,
      //   value: item.htmlId!.toString(),
      //   key: item.htmlId!.toString(),
      //   children: item.children && item.children.length > 0 ? _create(item.children) : null,
      // }))
    }
    this.state.tree = _create(authList)
  }

  handleSubmit = () => {
    const { form, onSubmit, actionTag } = this.props;
    form.validateFields(err => {
      if (!err) {
        let formData: Role = { ...form.getFieldsValue(), roleId: actionTag.roleId }
        onSubmit(formData)
      }
    })
  }

  render() {
    const { tree } = this.state
    const { form, onClose, upDataLoading, actionTag } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="vertical">
        <Form.Item label={formatMessage({ id: 'authority-role.form.name' })}>
          {getFieldDecorator('roleName', {
            initialValue: actionTag.roleName,
            rules: [{ required: true, message: formatMessage({ id: 'authority-role.form.rule.name' }) }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage({ id: 'authority-role.form.desc' })}>
          {getFieldDecorator('roleDescription', {
            initialValue: actionTag.roleDescription,
            rules: [{ required: true, message: formatMessage({ id: 'authority-role.form.rule.desc' }) }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage({ id: 'authority-role.form.auth' })}>
          {getFieldDecorator('htmlIds', {
            initialValue: actionTag.htmlIds,
            rules: [{ required: true, message: formatMessage({ id: 'authority-role.form.rule.auth' }) }],
          })(
            <TreeSelect
              allowClear={true}
              treeCheckable={true}
              showCheckedStrategy={SHOW_ALL}
              treeData={tree as unknown as TreeCreate[]}
              placeholder=""
              treeDefaultExpandAll
            />
          )}
        </Form.Item>
        <Form.Item>
          <Button
            size="large"
            loading={upDataLoading}
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

export default Form.create<RoleFormProp>()(RoleForm);