import React, { useEffect, useState } from 'react';
import { MenuDataItem } from '@ant-design/pro-layout';
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
import { IRoute } from 'umi-types';

interface SecurityLayoutProps extends ConnectProps {
  loading: boolean;
  currentUser: CurrentUser;
  initialRoutes: Route[],
  authList: MenuDataItem[],
  dispatch: Dispatch;
}




const SecurityLayoutFunc: React.FC<SecurityLayoutProps> = props => {
  const { dispatch, authList, route, initialRoutes, loading, currentUser, children } = props;

  const [isReady, setIsReady] = useState<boolean>(false)

  if (route && route.routes) {
    if (initialRoutes.length === 0) {
      dispatch({
        type: 'auth/setRoutesReducers',
        payload: lodash.cloneDeep(route.routes[0].routes)
      })
    }
  }

  useState(() => {
    if (dispatch) {
      // 判断一下是否有token 没有token直接跳到登录页
      if (getToken()) {
        // 获取权限列表
        dispatch({
          type: 'auth/getAuthList',
        });
        // 获取用户信息
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
  });

  const [components, setComponents] = useState<Map<string, any>>();// react hook
  const newInitialRoutes = lodash.cloneDeep(initialRoutes); // 防止每次请求到权限资源信息都添加到route.router，导致很多重复并且很长，所以先储存最开始的，然后每请求一次就注入route.router里

  function addRoute(menuItem: MenuDataItem) {
    let newMenuItem = lodash.cloneDeep(menuItem)
    if (menuItem.children && menuItem.children.length > 0) {
      (newMenuItem.children!).forEach(t => addRoute(t));
    } else if (route && route.routes && components) {
      newMenuItem.component = typeof menuItem.name === 'string' ? components.get(menuItem.name) : undefined
      newMenuItem.exact = true
      // route.routes.unshift(newMenuItem);
      newInitialRoutes.unshift(newMenuItem);
    }
  }

  // 将组件传到component变量里 react hook  重复的变量路由 
  function mapRoute(routes: IRoute[], map: Map<string, any>) {
    routes.filter(t => t.name).forEach((t: IRoute) => {
      map.set(t.name!, t.component)
      if (t.routes && t.routes.length > 0) {
        mapRoute(t.routes, map)
      }
    })
  }
  // 构建 更新路由所需的 components 
  useState(() => {
    if (route && route.routes) {
      const map = new Map<string, any>();
      mapRoute(route.routes[0].routes!, map)
      setComponents(map);
    }
  });

  // 当只有components, authList 变化 才会触发变化 
  useEffect(() => {
    if (route && route.routes && components && authList) {
      authList.forEach(addRoute);
      // 原本这里是 router.push(location.pathName) 发现总是跳 location.pathName=/  打印了location 发现有hash值 所以 直接截取hash值放进去 
      // router.push(location.hash.slice(1));
      route.routes[0].routes = newInitialRoutes
      if (newInitialRoutes.length > 0) {
        setIsReady(true)
      }
    }
    return () => {
      setIsReady(false)
    }
  }, [components, authList]);


  if ((!currentUser.id && loading) || !isReady) {
    return <PageLoading />;
  }
  if (!currentUser.id) {
    return <Redirect to="/user/login"></Redirect>;
  }
  return children;
}

export default connect(({ user, loading, auth }: ConnectState) => ({
  currentUser: user.currentUser,
  loading: loading.models.user,
  initialRoutes: auth.routes,
  authList: auth.authList,
}))(SecurityLayoutFunc);
