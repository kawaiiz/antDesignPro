import React, { useState, useEffect } from 'react'
import { FormComponentProps } from 'antd/es/form';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import styles from '../style.less'
import {
  Form,
  Input,
  Select,
  Button,
  Popover,
  Progress,
  Upload,
  Icon,
  notification
} from 'antd'
const { Option } = Select

import { Person } from '../data.d'
import { Role } from '@/pages/authority/authority-role/data'
import { getResourcesAuth } from '@/utils/utils'
import { setRole } from '@/pages/authority/authority-role/service'
import { getToken, getBaseUrl } from '@/utils/utils'
import { MyConfig } from '../../../../../config/config'
import { SetMethod } from '@/utils/axios'

const upImgFileUrl = MyConfig.upImgFileUrl

interface PersonFormProp extends FormComponentProps {
  actionTag: Person,
  upDataLoading: boolean,
  onClose: () => void,
  onSubmit: (from: Person) => void
}

const PersonForm: React.FC<PersonFormProp> = (props) => {
  const { form, onClose, actionTag, onSubmit, upDataLoading } = props;
  const { getFieldDecorator } = form;
  const [roleList, setRoleList] = useState([] as Role[])

  // 获取权限角色数组
  const getRoleList = async () => {
    try {
      if (!getResourcesAuth(46)) {
        notification.error({
          description: formatMessage({ id: 'component.not-role' }),
          message: formatMessage({ id: 'component.error' }),
        })
        return
      }
      const res = await setRole({ data: {}, method: SetMethod['get'] })
      setRoleList(res.data)
    } catch (e) {
      notification.error({
        description: e.errorMsg,
        message: formatMessage({ id: 'component.error' }),
      });
    }
  }

  useEffect(() => {
    getRoleList()
  }, [])


  const handleSubmit = () => {
    try {
      form.validateFields((err, value) => {
        console.log(value)
        if (!err) {
          let formData: Person = { ...form.getFieldsValue(), userId: actionTag.id }
          onSubmit(formData)
        } else {
          console.log(err)
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  const passwordProgressMap: {
    ok: 'success';
    pass: 'normal';
    poor: 'exception';
  } = {
    ok: 'success',
    pass: 'normal',
    poor: 'exception',
  };

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

  const getPasswordStatus = () => {
    const { form } = props;
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };

  const renderPasswordProgress = () => {
    const { form } = props;
    const value = form.getFieldValue('password');
    const passwordStatus = getPasswordStatus();
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

  const [help, setHelp] = useState('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [confirmDirty, setConfirmDirty] = useState(false) // 不知道干嘛的 字面意思 脏检查？ 
  const token = getToken()

  const checkConfirm = (rule: any, value: string, callback: (messgae?: string) => void) => {
    const { form } = props;
    if (value && value !== form.getFieldValue('password')) {
      callback(formatMessage({ id: 'reset-password.password.twice' }));
    } else if (!value && form.getFieldValue('password')) {
      callback(formatMessage({ id: 'reset-password.password.twice' }));
    } else {
      callback();
    }
  };

  const checkPassword = (rule: any, value: string, callback: (messgae?: string) => void) => {
    if (!value) {
      // 修改资料可以不传id
      if (!actionTag.id) {
        setHelp(formatMessage({ id: 'reset-password.password.required' }))
        setVisible(false)
        callback('error');
      } else {
        callback();
      }
    } else {
      setHelp('')
      if (!visible) {
        setVisible(!!value)
      }
      if (value.length < 6) {
        callback('error');
      } else {
        const { form } = props;
        if (value && confirmDirty) {
          form.validateFields(['confirm'], { force: true });
        }
        callback();
      }
    }
  };

  const handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setLoading(true)
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      setLoading(false)
      if (info.file.response.status === 200) {
        actionTag.iconUrl = info.file.response.data[0]
        return info.file.response.data[0]
      } else {
        notification.error({
          description: info.file.response.errorMsg,
          message: formatMessage({ id: 'component.error' }),
        });
      }
    }
  };

  return (
    <Form layout="vertical" onSubmit={handleSubmit}>
      <Form.Item label={formatMessage({ id: 'authority-person.form.name' })}>
        {getFieldDecorator('username', {
          initialValue: actionTag.username,
          rules: [{ required: true, message: formatMessage({ id: 'authority-person.form.rule.name' }) }],
        })(<Input />)}
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'authority-person.form.phone' })}>
        {getFieldDecorator('phoneNumber', {
          initialValue: actionTag.phoneNumber,
          rules: [{
            required: true,
            message: formatMessage({ id: 'authority-person.form.rule.phone' }),
          },
          {
            pattern: /^1\d{10}$/,
            message: formatMessage({ id: 'authority-person.form.rule.phone-style' }),
          },],
        })(<Input />)}
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'authority-person.form.role' })}>
        {getFieldDecorator('roleId', {
          initialValue: actionTag.roles && (actionTag.roles as Role[]).length > 0 ? actionTag.roles[0].roleId : undefined,
          rules: [{ required: true, message: formatMessage({ id: 'authority-person.form.rule.role' }) }],
        })(
          <Select>
            {
              roleList.map(item => <Option value={item.roleId!} key={item.roleId!}>{item.roleName}</Option>)
            }
          </Select>,
        )}
      </Form.Item>
      <Form.Item help={help} label={formatMessage({ id: 'authority-person.form.password' })}>
        <Popover
          getPopupContainer={node => {
            if (node && node.parentNode) {
              return node.parentNode as HTMLElement;
            }
            return node;
          }}
          content={
            <div style={{ padding: '4px 0' }}>
              {passwordStatusMap[getPasswordStatus()]}
              {renderPasswordProgress()}
              <div style={{ marginTop: 10 }}>
                <FormattedMessage id="reset-password.strength.msg" />
              </div>
            </div>
          }
          overlayStyle={{ width: 240 }}
          placement="bottomRight"
          visible={visible}
        >
          {getFieldDecorator('password', {
            rules: [
              {
                required: actionTag.id ? false : true,
                validator: checkPassword,
              },
            ],
          })(
            <Input
              size="large"
              type="password"
            />,
          )}
        </Popover>
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'authority-person.form.confirm-password' })}>
        {getFieldDecorator('confirm', {
          rules: [
            {
              required: actionTag.id ? false : true,
              message: formatMessage({ id: 'reset-password.confirm-password.required' }),
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
      <Form.Item label={formatMessage({ id: 'authority-person.form.icon' })}>
        {getFieldDecorator('iconUrl', {
          initialValue: actionTag.iconUrl,
          getValueFromEvent: handleChange,
        })(
          <Upload
            name="iconUrl"
            action={getBaseUrl() + upImgFileUrl}
            listType="picture-card"
            accept="image/jpg,image/jpge,image/png"
            showUploadList={false}
            headers={{ 'Authorization': token }}
          >
            {actionTag.iconUrl ? <img src={getBaseUrl() + actionTag.iconUrl} alt="avatar" style={{ width: '100%' }} /> : (<div>
              <Icon type={loading ? 'loading' : 'plus'} />
            </div>)}
          </Upload>,
        )}
      </Form.Item>
      <Form.Item>
        <Button
          size="large"
          loading={upDataLoading}
          disabled={upDataLoading}
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

export default Form.create<PersonFormProp>()(PersonForm);