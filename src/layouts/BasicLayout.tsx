/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */

import ProLayout, {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
  SettingDrawer,
} from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import Link from 'umi/link';
import router from 'umi/router'
import { Route } from '@ant-design/pro-layout/lib/typings'
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';

import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState } from '@/models/connect';

import { MyConfig } from '../../config/config'
import lodash from 'lodash'

// import logo from '../assets/logo.svg';
import logo from '../assets/logo.png';
import { IRoute } from 'umi-types';

export interface BasicLayoutProps extends ProLayoutProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
  settings: Settings;
  dispatch: Dispatch;
  authList: [];
  initialRoutes: Route[]
}

export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
};

/**
 * use Authorized check all menu item
 */

const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] => {
  return menuList.map(item => {
    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : [],
    };
    return Authorized.check(item.authority, localItem, null) as MenuDataItem;
  });
}


const footerRender: BasicLayoutProps['footerRender'] = (_, defaultDom) => {
  return React.cloneElement(defaultDom as React.ReactElement, MyConfig.footerContent)
}

const BasicLayout: React.FC<BasicLayoutProps> = props => {
  const { dispatch, children, settings, authList, route, initialRoutes } = props;
  const newInitialRoutes = lodash.cloneDeep(initialRoutes); // 防止每次请求到权限资源信息都添加到route.router，导致很多重复并且很长，所以先储存最开始的，然后每请求一次就注入route.router里
  const [components, setComponents] = useState<Map<string, any>>();// react hook
  function addRoute(menuItem: MenuDataItem) {
    let newMenuItem = lodash.cloneDeep(menuItem)
    if (menuItem.children && menuItem.children.length > 0) {
      newMenuItem.children.forEach(t => addRoute(t));
    } else if (route && route.routes && components) {
      newMenuItem.component = typeof menuItem.name === 'string' ? components.get(menuItem.name) : undefined
      newMenuItem.exact = true
      // route.routes.unshift(newMenuItem);
      newInitialRoutes.unshift(newMenuItem);
    }
  }

  useState(() => {
    if (dispatch) {
      dispatch({
        type: 'settings/getSetting',
      });
      // 因为在SecurityLayout里已经请求过一次这里就隐藏了
      // dispatch({
      //   type: 'user/fetchCurrent',
      // });
    }
    // 将组件传到component变量里 react hook  重复的变量路由 
    function _mapRoute(routes: IRoute[], map: Map<string, any>) {
      routes.filter(t => t.name).forEach((t: IRoute) => {
        map.set(t.name!, t.component)
        if (t.routes && t.routes.length > 0) {
          _mapRoute(t.routes, map)
        }
      })
    }
    if (route && route.routes) {
      if (initialRoutes.length === 0) {
        dispatch({
          type: 'auth/setRoutes',
          payload: lodash.cloneDeep(route.routes)
        })
      }
      const map = new Map<string, any>();
      _mapRoute(route.routes, map)
      setComponents(map);
    }
  });
  /**
   * constructor
   */
  useEffect(() => {
    if (route && route.routes && components && authList) {
      authList.forEach(addRoute);
      // 原本这里是 router.push(location.pathName) 发现总是跳 location.pathName=/  打印了location 发现有hash值 所以 直接截取hash值放进去 
      // router.push(location.hash.slice(1));
      route.routes = newInitialRoutes
    }
  }, [components, authList]);


  /**
   * init variables
   */
  const handleMenuCollapse = (payload: boolean): void => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  };

  // 自定义菜单的全球化函数 替代  原有的menuDataRender
  const setIi8Menu = (authList: MenuDataItem[]): MenuDataItem[] => {
    return authList.map(item => {
      const loaclItem = {
        name: item.name,
        ...item,
        children: item.children ? setIi8Menu(item.children) : []
      }
      loaclItem.name = formatMessage({
        id: `menu.${item.name}`,
        defaultMessage: item.name
      })
      return Authorized.check(item.authority, loaclItem, null) as MenuDataItem
    })
  }

  return (
    <>
      <ProLayout
        logo={logo}
        onCollapse={handleMenuCollapse}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (menuItemProps.isUrl) {
            return defaultDom;
          }
          return <Link to={menuItemProps.path}>{defaultDom}</Link>;
        }}
        breadcrumbRender={(routers = []) => [
          {
            path: '/',
            breadcrumbName: formatMessage({
              id: 'menu.home',
              defaultMessage: 'Home',
            }),
          },
          ...routers,
        ]}
        itemRender={(route, params, routes, paths) => {
          const first = routes.indexOf(route) === 0;
          return first ? (
            <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
          ) : (
              <span>{route.breadcrumbName}</span>
            );
        }}
        footerRender={footerRender}
        menuDataRender={() => setIi8Menu(authList)}
        // menuDataRender={menuDataRender}
        formatMessage={formatMessage}
        rightContentRender={rightProps => <RightContent {...rightProps} />}
        {...props}
        {...settings}
      >
        {children}
      </ProLayout>
      <SettingDrawer
        settings={settings}
        onSettingChange={config =>
          dispatch({
            type: 'settings/changeSetting',
            payload: config,
          })
        }
      />
    </>
  );
};

export default connect(({ global, auth, settings, loading }: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
  authList: auth.authList,
  initialRoutes: auth.routes
}))(BasicLayout);
