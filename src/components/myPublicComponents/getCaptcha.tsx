import React, { useState, useEffect } from 'react'
import { Button, notification } from 'antd'
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { ConnectState } from '@/models/connect';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';


interface getCaptchaProp {
  phoneNumber: string;
  type: string;
  dispatch: Dispatch<any>;
  captchaTime: number,
  captchaDisable: boolean,
  size?: 'small' | 'large' | 'default'
}

const getCaptcha: React.FC<getCaptchaProp> = (props) => {
  const { captchaTime, captchaDisable, phoneNumber, type, size } = props
  const getCaptchaRequest = async () => {
    try {
      const { dispatch } = props
      if (!(/^1\d{10}$/.test(phoneNumber))) {
        notification.error({
          description: formatMessage({ id: 'component.phone-style' }),
          message: formatMessage({ id: 'component.error' }),
        });
        return;
      }
      dispatch({
        type: 'global/getCaptcha',
        payload: {
          phoneNumber,
          type
        }
      })
    } catch (e) {
      console.log(e)
    }
  }
  return (
    <Button onClick={getCaptchaRequest} disabled={captchaDisable} block size={size ? size : 'default'}>
      {captchaDisable ? `${captchaTime}s` : <FormattedMessage id="component.captcha-get" />}
    </Button>
  )
}

export default connect(({ global }: ConnectState) => ({
  captchaTime: global.captchaTime,
  captchaDisable: global.captchaDisable
}))(getCaptcha);
