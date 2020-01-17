import React, { useState } from 'react'
import { Button, Form, Input, Upload, message, Row, Col, notification } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { FormComponentProps } from 'antd/es/form';

interface ResetPasswordProps extends FormComponentProps {
  upDataLoading: boolean
  onSubmit: (from: any) => Promise<any>,
}


const resetPassword: React.FC<ResetPasswordProps> = (props) => {
  const { form, onSubmit, upDataLoading } = props;
  const { getFieldDecorator } = form

  const checkPassword = (rule: any, value: string, callback: (messgae?: string) => void) => {
    if (!value) {
      callback("");
    } else {
      if (value.length < 6) {
        callback(formatMessage({ id: 'account-settings.reset-password.password-length' }));
      } else {
        callback();
      }
    }
  };

  const checkConfirm = (rule: any, value: string, callback: (messgae?: string) => void) => {
    if (value && value !== form.getFieldValue('newPassword')) {
      callback(formatMessage({ id: 'account-settings.reset-password.confirmPassword-message2' }));
    } else if (!value && form.getFieldValue('newPassword')) {
      callback("");
    } else {
      callback();
    }
  };


  const handlerSubmit = () => {
    form.validateFields(async (err) => {
      try {
        if (!err) {
          await onSubmit(form.getFieldsValue())
          form.resetFields()
        }
      } catch (e) {
        console.log(e)
      }
    });
  };

  return (
    <Row>
      <Col lg={12} xl={8}>
        <Form layout="vertical" hideRequiredMark>
          <Form.Item label={formatMessage({ id: 'account-settings.reset-password.oldPassword' })}>
            {getFieldDecorator('oldPassword', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'account-settings.reset-password.oldPassword-message' }, {}),
                },
              ],
            })(<Input
              type="password"
            />)}
          </Form.Item>
          <Form.Item label={formatMessage({ id: 'account-settings.reset-password.newPassword' })}>
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
                type="password"
              />,
            )}
          </Form.Item>
          <Button type="primary" onClick={handlerSubmit} loading={upDataLoading} disabled={upDataLoading}>
            <FormattedMessage id="component.confirm" defaultMessage="Update Information" />
          </Button>
        </Form>
      </Col>
    </Row>
  )
}

export default Form.create<ResetPasswordProps>()(resetPassword);