import React from 'react';
import { connect } from 'dva';
import { Redirect } from 'umi';
import { ConnectState, ConnectProps } from '@/models/connect';
import { CurrentUser } from '@/models/user';
import PageLoading from '@/components/PageLoading';
import { notification } from 'antd';
import { getToken } from '@/utils/utils'
import router from 'umi/router';

interface SecurityLayoutProps extends ConnectProps {
  loading: boolean;
  currentUser: CurrentUser;
}

interface SecurityLayoutState {
  isReady: boolean;
}

class SecurityLayout extends React.Component<SecurityLayoutProps, SecurityLayoutState> {
  state: SecurityLayoutState = {
    isReady: false,
  };

  componentDidMount() {
    this.setState({
      isReady: true,
    });
    const { dispatch } = this.props;
    if (dispatch) {
      // 判断一下是否有token 没有token直接跳到登录页
      if (getToken()) {
        dispatch({
          type: 'user/fetchCurrent',
        });
      } else {
        notification.error({
          description: '您的登录已失效，请重新登录',
          message: '登录失效',
        });
        router.push({
          pathname: 'login',
        });
      }
    }
  }

  render() {
    const { isReady } = this.state;
    const { children, loading, currentUser } = this.props;

    if ((!currentUser.id && loading) || !isReady) {
      return <PageLoading />;
    }
    if (!currentUser.id) {
      return <Redirect to="/user/login"></Redirect>;
    }
    return children;
  }
}

export default connect(({ user, loading }: ConnectState) => ({
  currentUser: user.currentUser,
  loading: loading.models.user,
}))(SecurityLayout);
