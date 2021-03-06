import { Button, Col, Form, Input, Popover, Progress, Row, Select, message, notification } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import Link from 'umi/link';
import { connect } from 'dva';
import router from 'umi/router';

import { StateType } from './model';
import styles from './style.less';

import GetCaptcha from '@/components/zml/GetCaptcha/index'

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;

const passwordStatusMap = {
  ok: (
    <div className={styles.success}>
      <FormattedMessage id="reset-password.strength.strong" />
    </div>
  ),
  pass: (
    <div className={styles.warning}>
      <FormattedMessage id="reset-password.strength.medium" />
    </div>
  ),
  poor: (
    <div className={styles.error}>
      <FormattedMessage id="reset-password.strength.short" />
    </div>
  ),
};

const passwordProgressMap: {
  ok: 'success';
  pass: 'normal';
  poor: 'exception';
} = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception',
};

interface ResetPasswordProps extends FormComponentProps {
  dispatch: Dispatch<any>;
  userResetPassword: StateType;
  submitting: boolean;
}
interface ResetPasswordState {
  confirmDirty: boolean;
  visible: boolean;
  help: string;
}

export interface UserResetPasswordParams {
  username: string;
  password: string;
  confirm: string;
  phoneNumber: string;
  smsCode: string;
}

@connect(
  ({
    userResetPassword,
    loading,
  }: {
    userResetPassword: StateType;
    loading: {
      effects: {
        [key: string]: string;
      };
    };
  }) => ({
    userResetPassword,
    submitting: loading.effects['userResetPassword/submit'],
  }),
)
class ResetPassword extends Component<
ResetPasswordProps,
ResetPasswordState
> {
  state: ResetPasswordState = {
    confirmDirty: false,
    visible: false,
    help: '',
  };

  interval: number | undefined = undefined;

  componentDidUpdate() {
    const { userResetPassword } = this.props;
    if (userResetPassword.status === 'ok') {
      message.success('修改成功');
      router.push({
        pathname: '/user/login'
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userResetPassword/initState'
    });
    clearInterval(this.interval);
  }

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };

  handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFields({ force: true }, async (err, values) => {
      try {
        if (!err) {
          await dispatch({
            type: 'userResetPassword/submit',
            payload: values,
          });
          message.success(formatMessage({ id: 'component.action-success' }));
          router.push({
            pathname: '/user/login',
          });
        }
      } catch (e) {
        notification.error({
          description: e.errorMsg,
          message: formatMessage({ id: 'component.error' }),
        });
      }
    });

  };

  checkConfirm = (rule: any, value: string, callback: (messgae?: string) => void) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback(formatMessage({ id: 'reset-password.password.twice' }));
    } else {
      callback();
    }
  };

  checkPassword = (rule: any, value: string, callback: (messgae?: string) => void) => {
    const { visible, confirmDirty } = this.state;
    if (!value) {
      this.setState({
        help: formatMessage({ id: 'reset-password.password.required' }),
        visible: !!value,
      });
      callback('error');
    } else {
      this.setState({
        help: '',
      });
      if (!visible) {
        this.setState({
          visible: !!value,
        });
      }
      if (value.length < 6) {
        callback('error');
      } else {
        const { form } = this.props;
        if (value && confirmDirty) {
          form.validateFields(['confirm'], { force: true });
        }
        callback();
      }
    }
  };

  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    const passwordStatus = this.getPasswordStatus();
    return value && value.length ? (
      <div className={styles[`progress-${passwordStatus}`]}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={styles.progress}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };

  render() {
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;
    const { help, visible } = this.state;
    return (
      <div className={styles.main}>
        <h3>
          <FormattedMessage id="reset-password.reset-password.reset-password" />
        </h3>
        <Form>
          <FormItem>
            {getFieldDecorator('username', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'reset-password.username.required' }),
                }
              ],
            })(
              <Input
                size="large"
                placeholder={formatMessage({ id: 'reset-password.username.placeholder' })}
              />,
            )}
          </FormItem>
          <FormItem help={help}>
            <Popover
              getPopupContainer={node => {
                if (node && node.parentNode) {
                  return node.parentNode as HTMLElement;
                }
                return node;
              }}
              content={
                <div style={{ padding: '4px 0' }}>
                  {passwordStatusMap[this.getPasswordStatus()]}
                  {this.renderPasswordProgress()}
                  <div style={{ marginTop: 10 }}>
                    <FormattedMessage id="reset-password.strength.msg" />
                  </div>
                </div>
              }
              overlayStyle={{ width: 240 }}
              placement="right"
              visible={visible}
            >
              {getFieldDecorator('password', {
                rules: [
                  {
                    validator: this.checkPassword,
                  },
                ],
              })(
                <Input
                  size="large"
                  type="password"
                  placeholder={formatMessage({ id: 'reset-password.password.placeholder' })}
                />,
              )}
            </Popover>
          </FormItem>
          <FormItem>
            {getFieldDecorator('confirmPassword', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'reset-password.confirm-password.required' }),
                },
                {
                  validator: this.checkConfirm,
                },
              ],
            })(
              <Input
                size="large"
                type="password"
                placeholder={formatMessage({ id: 'reset-password.confirm-password.placeholder' })}
              />,
            )}
          </FormItem>
          <FormItem>
            <InputGroup compact>
              {getFieldDecorator('phoneNumber', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'reset-password.phone-number.required' }),
                  },
                  {
                    pattern: /^\d{11}$/,
                    message: formatMessage({ id: 'reset-password.phone-number.wrong-format' }),
                  },
                ],
              })(
                <Input
                  size="large"
                  placeholder={formatMessage({ id: 'reset-password.phone-number.placeholder' })}
                />,
              )}
            </InputGroup>
          </FormItem>
          <FormItem>
            <Row gutter={8}>
              <Col span={16}>
                {getFieldDecorator('smsCode', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'reset-password.verification-code.required' }),
                    },
                  ],
                })(
                  <Input
                    size="large"
                    placeholder={formatMessage({ id: 'reset-password.verification-code.placeholder' })}
                  />,
                )}
              </Col>
              <Col span={8}>
                <GetCaptcha phoneNumber={form.getFieldValue('phoneNumber')} type='login' size="large" />
              </Col>
            </Row>
          </FormItem>
          <FormItem>
            <Button
              size="large"
              loading={submitting}
              className={styles.submit}
              type="primary"
              onClick={this.handleSubmit}
            >
              <FormattedMessage id="reset-password.form.submit" />
            </Button>
            <Link className={styles.login} to="/user/login">
              <FormattedMessage id="reset-password.register.sign-in" />
            </Link>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create<ResetPasswordProps>()(ResetPassword);
