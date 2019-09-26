import React, { useState } from 'react'
import { Button, Form, Input, Upload, message, Row, Col, notification } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { FormComponentProps } from 'antd/es/form';

interface ResetPasswordProps extends FormComponentProps {
  onSubmit: (from: any) => void
}


const resetPassword: React.FC<ResetPasswordProps> = (props) => {
  const { form, onSubmit } = props;
  const { getFieldDecorator } = form
  const [help, setHelp] = useState('')

  const checkPassword = (rule: any, value: string, callback: (messgae?: string) => void) => {

    if (!value) {
      setHelp(formatMessage({ id: 'account-settings.reset-password.newPassword-message' }))
      callback();
    } else {
      setHelp('')
      if (value.length < 6) {
        callback('error');
      } else {
        callback();
      }
    }
  };

  const checkConfirm = (rule: any, value: string, callback: (messgae?: string) => void) => {
    if (value && value !== form.getFieldValue('newPassword')) {
      callback(formatMessage({ id: 'account-settings.reset-password.confirmPassword-message2' }));
    } else if (!value && form.getFieldValue('newPassword')) {
      callback();
    } else {
      callback();
    }
  };


  const handlerSubmit = () => {
    try {
      form.validateFields(err => {
        console.log(err)
        if (!err) {
          onSubmit(form.getFieldsValue())
          form.resetFields()
        }
      });
    } catch (e) {
      notification.error({
        description: e.errorMsg,
        message: formatMessage({ id: 'component.error' }),
      });
    }

  };

  return (
    <Row>
      <Col lg={12} xl={8}>
        <Form layout="vertical" hideRequiredMark onSubmit={handlerSubmit}>
          <Form.Item label={formatMessage({ id: 'account-settings.reset-password.oldPassword' })}>
            {getFieldDecorator('oldPassword', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'account-settings.reset-password.oldPassword-message' }, {}),
                },
              ],
            })(<Input />)}
          </Form.Item>
          <Form.Item help={help} label={formatMessage({ id: 'account-settings.reset-password.newPassword' })}>
            {getFieldDecorator('newPassword', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'account-settings.reset-password.newPassword-message' }),
                },
                {
                  validator: checkPassword,
                },
              ],
            })(
              <Input
                size="large"
                type="password"
              />,
            )}
          </Form.Item>
          <Form.Item label={formatMessage({ id: 'account-settings.reset-password.confirmPassword' })}>
            {getFieldDecorator('confirmPassword', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'account-settings.reset-password.confirmPassword-message' }),
                },
                {
                  validator: checkConfirm,
                },
              ],
            })(
              <Input
                size="large"
                type="password"
              />,
            )}
          </Form.Item>
          <Button type="primary" htmlType="submit">
            <FormattedMessage id="component.confirm" defaultMessage="Update Information" />
          </Button>
        </Form>
      </Col>
    </Row>
  )
}

export default Form.create<ResetPasswordProps>()(resetPassword);