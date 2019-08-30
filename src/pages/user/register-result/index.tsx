import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { Button, Result } from 'antd';
import Link from 'umi/link';
import React from 'react';
import { RouteChildrenProps } from 'react-router';

import styles from './style.less';

const actions = (
  <div className={styles.actions}>
    <Link to="/">
      <Button size="large">
        <FormattedMessage id="user-register-result.register.sign-in" />
      </Button>
    </Link>
  </div>
);

const RegisterResult: React.FC<RouteChildrenProps> = ({ location }) => {
  return (
    <Result
      className={styles.registerResult}
      status="success"
      title={
        <div className={styles.title}>
          <FormattedMessage
            id="user-register-result.register-result.msg"
            values={{ userName: location.state ? location.state.account : '您的账户名' }}
          />
        </div>
      }
      subTitle={formatMessage({ id: 'user-register-result.register-result.activation-email' })}
      extra={actions}
    />
  );
}

export default RegisterResult;
