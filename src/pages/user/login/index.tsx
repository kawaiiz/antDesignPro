import { Alert, Checkbox } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component } from 'react';

import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { Dispatch, AnyAction } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import Link from 'umi/link';
import { connect } from 'dva';
import { StateType } from '@/models/login';
import LoginComponents from './components/Login';
import styles from './style.less';
import { LoginParamsType } from '@/services/login';
import { ConnectState } from '@/models/connect';
import { delToken } from '@/utils/utils'
import { MyConfig } from 'config'

const REFRESH_TOKEN = MyConfig.refreshToken

const { Tab, UserName, Password, Mobile, Captcha, Submit } = LoginComponents;

interface LoginProps {
  dispatch: Dispatch<AnyAction>;
  userLogin: StateType;
  submitting: boolean;
}
interface LoginState {
  type: string;
  autoLogin: boolean;
}

@connect(({ login, loading }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
}))
class Login extends Component<LoginProps, LoginState> {
  loginForm: FormComponentProps['form'] | undefined | null = undefined;

  state: LoginState = {
    type: 'account',
    autoLogin: true,
  };

  constructor(props: any) {
    super(props)
    delToken()
    delToken(REFRESH_TOKEN)

  }

  changeAutoLogin = (e: CheckboxChangeEvent) => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  handleSubmit = async (err: unknown, values: LoginParamsType) => {
    try {
      const { type } = this.state;
      if (!err) {
        const { dispatch } = this.props;
        await dispatch({
          type: 'login/login',
          payload: {
            ...values,
            type,
          },
        });
      }
    } catch (e) {
      console.log(e)
    }
  };

  onTabChange = (type: string) => {
    this.setState({ type });
  };

  renderMessage = (content: string) => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  render() {
    const { userLogin, submitting } = this.props;
    const { status, type: loginType } = userLogin;
    const { type, autoLogin } = this.state;
    return (
      <div className={styles.main}>
        <LoginComponents
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          onCreate={(form?: FormComponentProps['form']) => {
            this.loginForm = form;
          }}
        >
          <Tab key="account" tab={formatMessage({ id: 'user-login.login.tab-login-credentials' })}>
            {status === 'error' &&
              loginType === 'account' &&
              !submitting &&
              this.renderMessage(
                formatMessage({ id: 'user-login.login.message-invalid-credentials' }),
              )}
            <UserName
              name="username"
              placeholder={formatMessage({ id: 'user-login.login.username' })}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'user-login.username.required' }),
                },
              ]}
            />
            <Password
              name="password"
              placeholder={formatMessage({ id: 'user-login.login.password' })}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'user-login.password.required' }),
                },
              ]}
              onPressEnter={e => {
                e.preventDefault();
                if (this.loginForm) {
                  this.loginForm.validateFields(this.handleSubmit);
                }
              }}
            />
          </Tab>
          <Tab key="mobile" tab={formatMessage({ id: 'user-login.login.tab-login-mobile' })}>
            {status === 'error' &&
              loginType === 'mobile' &&
              !submitting &&
              this.renderMessage(
                formatMessage({ id: 'user-login.login.message-invalid-verification-code' }),
              )}
            <Mobile
              name="phoneNumber"
              placeholder={formatMessage({ id: 'user-login.phone-number.placeholder' })}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'user-login.phone-number.required' }),
                },
                {
                  pattern: /^1\d{10}$/,
                  message: formatMessage({ id: 'user-login.phone-number.wrong-format' }),
                },
              ]}
            />
            <Captcha
              name="smsCode"
              placeholder={formatMessage({ id: 'user-login.verification-code.placeholder' })}
              getCaptchaSecondText={formatMessage({ id: 'user-login.captcha.second' })}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'user-login.verification-code.required' }),
                },
              ]}
            />
          </Tab>
          <div>
            <Checkbox checked={autoLogin} onChange={this.changeAutoLogin}>
              <FormattedMessage id="user-login.login.remember-me" />
            </Checkbox>
            <Link style={{ float: 'right' }} to="/user/reset-password">
              <FormattedMessage id="user-login.login.forgot-password" />
            </Link>
          </div>
          <Submit loading={submitting}>
            <FormattedMessage id="user-login.login.login" />
          </Submit>
          <div className={styles.other}>
            {/* <FormattedMessage id="user-login.login.sign-in-with" />
            <Icon type="alipay-circle" className={styles.icon} theme="outlined" />
            <Icon type="taobao-circle" className={styles.icon} theme="outlined" />
            <Icon type="weibo-circle" className={styles.icon} theme="outlined" /> */}
            <Link className={styles.register} to="/user/register">
              <FormattedMessage id="user-login.login.signup" />
            </Link>
          </div>
        </LoginComponents>
      </div>
    );
  }
}

export default Login;
