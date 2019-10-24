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
import { MyConfig } from 'config';

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
          pathname: '/user/login',
        });
      }
    }
  });

  const [components, setComponents] = useState<Map<string, any>>();// react hook
  const newInitialRoutes = lodash.cloneDeep(initialRoutes); // 防止每次请求到权限资源信息都添加到route.router，导致很多重复并且很长，所以先储存最开始的，然后每请求一次就注入route.router里

  let HOME_PATH = ''

  // 只插入第一级的路由，因为子路由在第一级路由的children/router字段里
function addRoute(menuItem: MenuDataItem, index: number) {
    let newMenuItem = lodash.cloneDeep(menuItem)
    newMenuItem.routes = []
    newMenuItem.component = typeof menuItem.name === 'string' ? components!.get(menuItem.name) : undefined
    newMenuItem.exact = true
    if (menuItem.children && menuItem.children.length > 0) {
      // (newMenuItem.children!).forEach((t: MenuDataItem) => addRoute(t, index + 1));
      for (let i = 0; i < newMenuItem.children!.length; i++) {
        newMenuItem.routes[i] = addRoute(newMenuItem.children![i], index + 1)
      }
    }
    if (index === 0) {
      newInitialRoutes.unshift(newMenuItem);
    }
    // 插入 当path:'/'重定向的路径
    if (HOME_PATH.length === 0 && menuItem.own) {
      HOME_PATH = menuItem.path
      MyConfig.HOME_PATH = menuItem.path
      newInitialRoutes.unshift({ path: '/', redirect: menuItem.path, exact: true })
    }
    return newMenuItem
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
    if (route && route.routes && !components) {
      const map = new Map<string, any>();
      mapRoute(route.routes[0].routes!, map)
      setComponents(map);
    }
  });

  // 当只有components, authList 变化 才会触发变化 
  useEffect(() => {
    if (route && route.routes && components && authList) {
      authList.forEach((item) => addRoute(item, 0))
      // 原本这里是 router.push(location.pathName) 发现总是跳 location.pathName=/  打印了location 发现有hash值 所以 直接截取hash值放进去 
      // router.push(location.hash.slice(1));
      // 因为在不打开调试情况下 newInitialRoutes第一次运行是空数组 
      if (newInitialRoutes.length > 0) {
        route.routes[0].routes = newInitialRoutes
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
