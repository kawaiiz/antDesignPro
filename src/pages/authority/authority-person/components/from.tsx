import React from 'react'
import { FormComponentProps } from 'antd/es/form';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import styles from '../style.less'
import {
  Form,
  Input,
  Radio,
  Button,
  TreeSelect,
} from 'antd'
import { Person } from '../data.d'
import { Role } from '@/pages/authority/authority-role/data'

interface PersonFormProp extends FormComponentProps {
  actionTag: Person,
  roleList: Role[],
  loading: boolean,
  onClose: () => void,
  onSubmit: (from: Person) => void
}

const PersonForm: React.FC<PersonFormProp> = (props) => {
  const { form, onClose, actionTag, onSubmit, loading } = props;
  const { getFieldDecorator } = form;
  const { } = props;
  const handleSubmit = () => {

    form.validateFields(err => {
      if (!err) {
        let formData: Person = { ...form.getFieldsValue(), userId: actionTag.userId }
        onSubmit(formData)
      }
    })
  }

  return (
    <Form layout="vertical" onSubmit={handleSubmit}>
      <Form.Item label={formatMessage({ id: 'authority-person.form.name' })}>
        {getFieldDecorator('username', {
          initialValue: actionTag.username,
          rules: [{ required: true, message: formatMessage({ id: 'authority-person.form.rule.name' }) }],
        })(<Input />)}
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

export default Form.create<PersonFormProp>()(PersonForm);