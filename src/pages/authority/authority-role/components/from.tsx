import React, { Component } from 'react';
import { IRoute } from 'umi-types/config';
import { FormComponentProps } from 'antd/es/form';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import styles from '../style.less';
import { Form, Input, Button, TreeSelect } from 'antd';
import { TreeNode } from 'antd/lib/tree-select/interface';
const { SHOW_ALL } = TreeSelect;
import { isDevelopment } from '@/utils/utils';
import { Auth } from '@/pages/authority/authority-auth/data';
import { Role } from '../data.d';
import { MyConfig } from 'config';

interface RoleFormState {
  tree?: TreeNode[]; // 下拉框内数据
}

interface RoleFormProp extends FormComponentProps {
  actionTag: Role;
  actionType: 'add' | 'edit' | 'delete' | null;
  authList: Auth[];
  upDataLoading: boolean;
  onClose: () => void;
  onSubmit: (from: Role) => void;
}

class RoleForm extends Component<RoleFormProp, RoleFormState> {
  state: RoleFormState = {
    tree: [],
  };

  componentDidMount() {
    this.createTree();
  }

  // 创建树形结构
  createTree = () => {
    const { authList } = this.props;
    function _create(authList: IRoute[]): TreeNode[] {
      let tree = [];
      for (let i = 0; i < authList.length; i++) {
        // 如果是生产环境就跳过这两个页面
        if (!isDevelopment() && (authList[i].htmlId == 28 || authList[i].htmlId === 29)) continue;
        const newItem = {
          title:
            authList[i].htmlType === 'PAGE' && MyConfig.menuType === 'i18n'
              ? formatMessage({
                  id: `menu.${authList[i].alias}`,
                  defaultMessage: authList[i].alias,
                }) + '页面'
              : authList[i].htmlName,
          value: authList[i].htmlId!.toString(),
          key: authList[i].htmlId!.toString(),
          children:
            authList[i].children && authList[i].children.length > 0
              ? _create(authList[i].children)
              : null,
        };
        tree.push(newItem);
      }
      return tree;
    }
    this.setState({
      tree: _create(authList),
    });
  };

  handleSubmit = () => {
    const { form, onSubmit, actionTag } = this.props;
    form.validateFields(err => {
      if (!err) {
        let formData: Role = { ...form.getFieldsValue(), roleId: actionTag.roleId };
        onSubmit(formData);
      }
    });
  };

  render() {
    const { tree } = this.state;
    const { form, onClose, upDataLoading, actionTag } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="vertical">
        <Form.Item label={formatMessage({ id: 'authority-role.form.name' })}>
          {getFieldDecorator('roleName', {
            initialValue: actionTag.roleName,
            rules: [
              { required: true, message: formatMessage({ id: 'authority-role.form.rule.name' }) },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage({ id: 'authority-role.form.desc' })}>
          {getFieldDecorator('roleDescription', {
            initialValue: actionTag.roleDescription,
            rules: [
              { required: true, message: formatMessage({ id: 'authority-role.form.rule.desc' }) },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage({ id: 'authority-role.form.auth' })}>
          {getFieldDecorator('htmlIds', {
            initialValue: actionTag.htmlIds,
            rules: [
              { required: true, message: formatMessage({ id: 'authority-role.form.rule.auth' }) },
            ],
          })(
            <TreeSelect
              allowClear={true}
              treeCheckable={true}
              showCheckedStrategy={SHOW_ALL}
              treeData={tree}
              placeholder=""
              treeDefaultExpandAll
            />,
          )}
        </Form.Item>
        <Form.Item>
          <Button
            size="large"
            loading={upDataLoading}
            className={styles['authority-from-button']}
            type="primary"
            onClick={this.handleSubmit}
          >
            <FormattedMessage id="component.confirm" />
          </Button>
          <Button
            size="large"
            onClick={() => {
              onClose();
            }}
          >
            {' '}
            <FormattedMessage id="component.cancel" />
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default Form.create<RoleFormProp>()(RoleForm);
