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
} from 'antd'

interface AuthFormState {
  loading: boolean,
  actionTag: IRoute
}

interface AuthFormProp extends FormComponentProps {
  actionTag: IRoute,
  onClose: () => void,
  onSubmit: (from: IRoute) => void
}

class AuthForm extends Component<AuthFormProp> {
  state: AuthFormState = {
    loading: false,
    actionTag: {
      name: '',
      path: '',
      component: '',
      icon: ' ',
      authority: '',
      hideInMenu: false
    }
  }

  constructor(props: AuthFormProp) {
    super(props)
    const { actionTag } = this.state
    this.state.actionTag = Object.assign(actionTag, props.actionTag)
  }

  handleSubmit = () => {
    const { form, onSubmit } = this.props;
    form.validateFields(err => {
      if (!err) {
        onSubmit(form.getFieldsValue())
      }
    })
  }

  render() {
    const { loading, actionTag } = this.state
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
        <Form.Item label="authority">
          {getFieldDecorator('authority', {
            initialValue: actionTag.authority,
          })(<Input />)}
        </Form.Item>
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

export default Form.create<AuthFormProp>()(AuthForm);