import React, { Component } from 'react';
import { ConnectState } from '@/models/connect';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { GridContent } from '@ant-design/pro-layout';
import { Menu, notification } from 'antd';
import BaseView from './components/base';
import ResetPassword from './components/resetPassword';
import styles from './style.less';
import { CurrentUser } from '@/models/user';

const { Item } = Menu;

interface SettingsProps {
  currentUser: CurrentUser;
  dispatch: Dispatch<any>,
}

type SettingsStateKeys = 'base' | 'resetPassword';
interface SettingsState {
  mode: 'inline' | 'horizontal';
  menuMap: {
    [key: string]: React.ReactNode;
  };
  selectKey: SettingsStateKeys;
  upDataLoading: boolean
}

@connect(
  ({ user }: ConnectState) => ({
    currentUser: user.currentUser,
  })
)
class Settings extends Component<
SettingsProps,
SettingsState
> {
  main: HTMLDivElement | undefined = undefined;
  constructor(props: SettingsProps) {
    super(props);
    const menuMap = {
      base: <FormattedMessage id="account-settings.menuMap.basic" defaultMessage="Basic Settings" />,
      resetPassword: <FormattedMessage id="account-settings.menuMap.reset-password" defaultMessage="reset password" />,
    };
    this.state = {
      mode: 'inline',
      menuMap,
      selectKey: 'base',
      upDataLoading: false
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  // 左边菜单
  getMenu = () => {
    const { menuMap } = this.state;
    return Object.keys(menuMap).map(item => <Item key={item}>{menuMap[item]}</Item>);
  };

  // 左边菜单标题
  getRightTitle = () => {
    const { selectKey, menuMap } = this.state;
    return menuMap[selectKey];
  };

  // 选择的菜单
  selectKey = (key: SettingsStateKeys) => {
    this.setState({
      selectKey: key,
    });
  };

  // 监听屏幕变化
  resize = () => {
    if (!this.main) {
      return;
    }
    requestAnimationFrame(() => {
      if (!this.main) {
        return;
      }
      let mode: 'inline' | 'horizontal' = 'inline';
      const { offsetWidth } = this.main;
      if (this.main.offsetWidth < 641 && offsetWidth > 400) {
        mode = 'horizontal';
      }
      if (window.innerWidth < 768 && offsetWidth > 400) {
        mode = 'horizontal';
      }
      this.setState({
        mode,
      });
    });
  };

  // 修改个人信息
  handlerChangeUserinfo = async (from: any) => {
    try {
      const { dispatch } = this.props;
      this.setState({
        upDataLoading: true
      })
      await dispatch({
        type: 'user/changeCurrent',
        payload: from
      });
      notification.success({
        description: formatMessage({ id: 'component.action-success' }),
        message: formatMessage({ id: 'component.success' }),
      });
      this.setState({
        upDataLoading: false
      })
    } catch (e) {
      console.log(e)
      notification.error({
        description: e.errorMsg,
        message: formatMessage({ id: 'component.error' }),
      });
      this.setState({
        upDataLoading: false
      })
    }
  }

  // 修改密码
  handlerChangePassword = async (from: any): Promise<any> => {
    try {
      const { dispatch } = this.props;
      this.setState({
        upDataLoading: true
      })
      await dispatch({
        type: 'user/changePassword',
        payload: from
      });
      notification.success({
        description: formatMessage({ id: 'component.action-success' }),
        message: formatMessage({ id: 'component.success' }),
      });
      this.setState({
        upDataLoading: false
      })
      return Promise.resolve()
    } catch (e) {
      notification.error({
        description: e.errorMsg,
        message: formatMessage({ id: 'component.error' }),
      });
      this.setState({
        upDataLoading: false
      })
      return Promise.reject(e)
    }
  }

  // 渲染 菜单对应的内容
  renderChildren = () => {
    const { selectKey, upDataLoading } = this.state;
    const { currentUser } = this.props
    switch (selectKey) {
      case 'base':
        return <BaseView currentUser={currentUser} onSubmit={this.handlerChangeUserinfo} upDataLoading={upDataLoading} />;
      case 'resetPassword':
        return <ResetPassword onSubmit={this.handlerChangePassword} upDataLoading={upDataLoading} />;
      default:
        break;
    }
    return null;
  };

  render() {
    const { mode, selectKey } = this.state;
    return (
      <GridContent>
        <div
          className={styles.main}
          ref={ref => {
            if (ref) {
              this.main = ref;
            }
          }}
        >
          <div className={styles.leftMenu}>
            <Menu
              mode={mode}
              selectedKeys={[selectKey]}
              onClick={({ key }) => this.selectKey(key as SettingsStateKeys)}
            >
              {this.getMenu()}
            </Menu>
          </div>
          <div className={styles.right}>
            <div className={styles.title}>{this.getRightTitle()}</div>
            {this.renderChildren()}
          </div>
        </div>
      </GridContent>
    );
  }
}

export default Settings;
