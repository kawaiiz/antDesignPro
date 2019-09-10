import React from 'react';
import { connect } from 'dva';
import { Redirect } from 'umi';
import { Dispatch } from 'redux';
import router from 'umi/router'
import { ConnectState, ConnectProps } from '@/models/connect';
import { CurrentUser } from '@/models/user';
import PageLoading from '@/components/PageLoading';
import { notification } from 'antd';
import { getToken } from '@/utils/utils'
import { Route } from '@ant-design/pro-layout/lib/typings'
import lodash from 'lodash'

interface SecurityLayoutProps extends ConnectProps {
  loading: boolean;
  currentUser: CurrentUser;
  initialRoutes: Route[],
  dispatch: Dispatch;
}

interface SecurityLayoutState {
  isReady: boolean;
}

class SecurityLayout extends React.Component<SecurityLayoutProps, SecurityLayoutState> {
  state: SecurityLayoutState = {
    isReady: false
  };

  constructor(props: SecurityLayoutProps) {
    super(props)
    const { route, initialRoutes, dispatch } = this.props
    if (dispatch) {
      if (route && route.routes) {
        if (initialRoutes.length === 0) {
          dispatch({
            type: 'auth/setRoutes',
            payload: lodash.cloneDeep(route.routes[0].routes)
          })
        }
      }
      // 判断一下是否有token 没有token直接跳到登录页
      if (getToken()) {
        // 获取用户信息
        dispatch({
          type: 'user/fetchCurrent',
        });
        // 获取权限列表
        dispatch({
          type: 'auth/getAuthList',
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

  componentWillMount() {

  }

  componentDidMount() {
    this.setState({
      isReady: true,
    });
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

export default connect(({ user, loading, auth }: ConnectState) => ({
  currentUser: user.currentUser,
  loading: loading.models.user,
  initialRoutes: auth.routes
}))(SecurityLayout);
