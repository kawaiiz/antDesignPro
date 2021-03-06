import { Button, Form, Input, Upload, Row, Col, notification } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component, Fragment } from 'react';
import { FormComponentProps } from 'antd/es/form';
import lodash from 'lodash'

import { CurrentUser } from '@/models/user';
import styles from './BaseView.less';

import { getBaseUrl, getToken } from '@/utils/utils'
import { MyConfig } from 'config'
import GetCaptcha from '@/components/zml/GetCaptcha/index'

const upImgFileUrl = MyConfig.upImgFileUrl

interface BaseViewProps extends FormComponentProps {
  currentUser: CurrentUser;
  upDataLoading: boolean;
  onSubmit: (from: any) => void
}

interface BaseViewState {
  currentUser: CurrentUser;
}

class BaseView extends Component<BaseViewProps, BaseViewState> {
  view: HTMLDivElement | undefined = undefined;
  state: BaseViewState = {
    currentUser: {}
  }

  constructor(props: BaseViewProps) {
    super(props)
    console.log(props)
    this.state.currentUser = lodash.cloneDeep(props.currentUser)
  }

  componentDidMount() {
    this.setBaseInfo();
  }

  setBaseInfo = () => {
    const { currentUser, form } = this.props;
    if (currentUser) {
      Object.keys(form.getFieldsValue()).forEach(key => {
        const obj = {};
        obj[key] = currentUser[key] || null;
        form.setFieldsValue(obj);
      });
    }
  };

  getAvatarURL() {
    const { currentUser } = this.props;
    if (currentUser) {
      if (currentUser.iconUrl) {
        return currentUser.iconUrl;
      }
      const url = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
      return url;
    }
    return '';
  }

  getViewDom = (ref: HTMLDivElement) => {
    this.view = ref;
  };

  // 验证手机号是否修改了 修改了则判断短信是否填入
  validateMobile = (value: any) => {
    console.log(this.state)
    const { currentUser } = this.state
    console.log(currentUser)
    console.log(value)
    if (value.phoneNumber === currentUser.phoneNumber) { 
      delete value.smsCode
      delete value.phoneNumber
      return true
    } else {
      if (value.smsCode) {
        return true
      } else {
        notification.error({
          description: formatMessage({ id: 'account-settings.basic.captcha-message' }),
          message: formatMessage({ id: 'component.error' }),
        });
        return false
      }
    }
  }

  handlerSubmit = () => {
    try {
      const { form, onSubmit } = this.props;
      form.validateFields(err => {
        if (!err) {
          const value = form.getFieldsValue()
          if (this.validateMobile(value)) {
            onSubmit(value)
            form.resetFields(['smsCode'])
          }
        }
      });
    } catch (e) {
      notification.error({
        description: e.errorMsg,
        message: formatMessage({ id: 'component.error' }),
      });
    }

  };

  // 获取短信


  // 修改头像
  handleUpAvatarChange = (info: any) => {
    const currentUser = this.props.currentUser
    if (info.file.status === 'uploading') {
      this.setState({
        loading: true
      })
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      this.setState({
        loading: false
      })
      if (info.file.response.status === 200) {
        currentUser.iconUrl = info.file.response.data[0]
        return info.file.response.data[0]
      } else {
        notification.error({
          description: info.file.response.errorMsg,
          message: formatMessage({ id: 'component.error' }),
        });
      }
    }
  };

  render() {
    const {
      form, currentUser, upDataLoading
    } = this.props;
    const { getFieldDecorator } = form
    return (
      <div ref={this.getViewDom}>
        <Form className={styles.baseView} layout="vertical" hideRequiredMark >
          <div className={styles.left}>
            <Form.Item label={formatMessage({ id: 'account-settings.basic.nickname' })}>
              {getFieldDecorator('username', {
                initialValue: currentUser.username,
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'account-settings.basic.nickname-message' }, {}),
                  },
                ],
              })(<Input disabled />)}
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'account-settings.basic.phone' })}>
              {getFieldDecorator('phoneNumber', {
                initialValue: currentUser.phoneNumber,
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'account-settings.basic.phone-message' }, {}),
                  },
                  {
                    pattern: /^\d{11}$/,
                    message: formatMessage({ id: 'account-settings.basic.phone-message2' }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
            <Form.Item label={formatMessage({ id: 'account-settings.basic.captcha' })}>
              <Row gutter={8}>
                <Col span={12}>
                  {getFieldDecorator('smsCode', {
                    // rules: [{ required: true, message: formatMessage({ id: 'account-settings.basic.captcha-message' }) }],
                  })(<Input />)}
                </Col>
                <Col span={12}>
                  <GetCaptcha phoneNumber={form.getFieldValue('phoneNumber')} type="setUserinfo" />
                </Col>
              </Row>
            </Form.Item>
            <Button type="primary" onClick={this.handlerSubmit} loading={upDataLoading} disabled={upDataLoading}>
              <FormattedMessage id="account-settings.basic.update" defaultMessage="Update Information" />
            </Button>
          </div>
          <div className={styles.right}>
            <Fragment>
              <Form.Item label={formatMessage({ id: 'authority-person.form.icon' })}>
                {getFieldDecorator('iconUrl', {
                  initialValue: currentUser.iconUrl,
                  getValueFromEvent: this.handleUpAvatarChange,
                })(
                  <Upload
                    name="iconUrl"
                    action={getBaseUrl() + upImgFileUrl}
                    accept="image/jpg,image/jpge,image/png"
                    showUploadList={false}
                    headers={{ 'Authorization': getToken() }}
                  >
                    <div className={styles.avatar}>
                      <img src={getBaseUrl() + currentUser.iconUrl} alt="avatar" />
                    </div>
                    <div className={styles.button_view}>
                      <Button icon="upload">
                        <FormattedMessage id="account-settings.basic.change-avatar" defaultMessage="Change avatar" />
                      </Button>
                    </div>
                  </Upload>,
                )}
              </Form.Item>
            </Fragment>
          </div>
        </Form>

      </div>
    );
  }
}

export default Form.create<BaseViewProps>()(BaseView);
