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
import { MyConfig } from 'config'
import { setToken } from '@/utils/utils'

interface SecurityLayoutProps extends ConnectProps {
  loading: boolean;
  currentUser: CurrentUser;
  initialRoutes: Route[],
  authRoutes: IRoute[],
  dispatch: Dispatch;
}

const SecurityLayoutFunc: React.FC<SecurityLayoutProps> = props => {
  const { dispatch, authRoutes, route, initialRoutes, loading, currentUser, children } = props;

  const [isReady, setIsReady] = useState<boolean>(false)

  // 自动登录
  const authLogin = () => {
    const TOKEN = MyConfig.token
    const REFRESH_TOKEN = MyConfig.refreshToken
    const AUTh_LOGIN = MyConfig.autoLogin
    const authLogin = localStorage.getItem(AUTh_LOGIN)
    const token = localStorage.getItem(TOKEN) || ''
    const refreshToken = localStorage.getItem(REFRESH_TOKEN) || ''
    if (authLogin === 'true') {
      setToken(token, TOKEN)
      setToken(refreshToken, REFRESH_TOKEN)
    }
    // else {
    //   router.replace({
    //     pathname: '/user/login'
    //   })
    // }
  }

  if (route && route.routes) {
    if (initialRoutes.length === 0) {
      dispatch({
        type: 'auth/setRoutesReducers',
        payload: lodash.cloneDeep(route.routes[0].routes)
      })
    }
  }

  useState(async () => {
    authLogin()
    if (dispatch) {
      // 判断一下是否有token 没有token直接跳到登录页
      if (getToken()) {
        // 这里必须用async/await控制流，因为ant SecurityLayout下面的路由是缓存住的，即使退出，还是会保留上一次对它的更改,只有把当前这个人的拥有的权限列表请求到，注入路由后才能放行
        // 获取权限列表
        await dispatch({
          type: 'auth/getGlobalAuthTree',
        });
        // 获取用户信息
        dispatch({
          type: 'user/fetchCurrent',
        });
      } else {
        // notification.error({
        //   description: '您的登录已失效，请重新登录',
        //   message: '登录失效',
        // });
        router.push({
          pathname: '/user/login',
        });
      }
    }
  });

  const [components, setComponents] = useState<Map<string, any>>();// react hook
  const newInitialRoutes = lodash.cloneDeep(initialRoutes); // 防止每次请求到权限资源信息都添加到route.router，导致很多重复并且很长，所以先储存最开始的，然后每请求一次就注入route.router里

  // 只插入第一级的路由，因为子路由在第一级路由的children/router字段里 这里只管注入路由， 不管首页 首页在 page/index.tsx里判断
  function addRoute(menuItem: IRoute, index: number) {
    let newMenuItem = lodash.cloneDeep(menuItem)
    newMenuItem.routes = []
    newMenuItem.component = typeof menuItem.name === 'string' ? components!.get(menuItem.name) : undefined
    newMenuItem.exact = true
    if (menuItem.children && menuItem.children.length > 0) {
      let isFirstPaga = true
      newMenuItem.routes.unshift({ path: newMenuItem.path, redirect: '', exact: true })
      for (let i = 0; i < newMenuItem.children!.length; i++) {
        // 当是有折叠列表的栏目时，给路由添加重定向 

        newMenuItem.routes.push(addRoute(newMenuItem.children![i], index + 1))
        if (isFirstPaga && newMenuItem.children![i].own) {
          isFirstPaga = false
          newMenuItem.routes[0].redirect = newMenuItem.children![i].path
        }
      }
    }
    if (index === 0) {
      newInitialRoutes.unshift(newMenuItem as Route);
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

  // 当只有components, authRoutes 变化 才会触发变化 
  useEffect(() => {
    if (route && route.routes && components && authRoutes) {
      authRoutes.forEach((item) => addRoute(item, 0))
      // 原本这里是 router.push(location.pathName) 发现总是跳 location.pathName=/  打印了location 发现有hash值 所以 直接截取hash值放进去 
      // router.push(location.hash.slice(1));
      // 因为在不打开调试情况下 newInitialRoutes第一次运行是空数组
      console.log(route.routes[0].routes)
      if (newInitialRoutes.length > 0) {
        route.routes[0].routes = newInitialRoutes
        setIsReady(true)
      }
    }
    return () => {
      setIsReady(false)
    }
  }, [components, authRoutes]);

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
  authRoutes: auth.authRoutes,
  loading: loading.models.user,
  initialRoutes: auth.routes,
}))(SecurityLayoutFunc);
