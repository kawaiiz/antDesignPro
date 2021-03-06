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
import React, { useState } from 'react';
import Link from 'umi/link';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import { IRoute } from 'umi-types/config';

import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState } from '@/models/connect';

import { MyConfig } from 'config';
// import logo from '../assets/logo.svg';
import logo from '@/assets/logo.png';
// import { router } from 'umi';

export interface BasicLayoutProps extends ProLayoutProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
  settings: Settings;
  dispatch: Dispatch;
  authRoutes: IRoute[];
}

export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
};

const footerRender: BasicLayoutProps['footerRender'] = (_, defaultDom) => {
  return React.cloneElement(defaultDom as React.ReactElement, MyConfig.footerContent);
};

const BasicLayout: React.FC<BasicLayoutProps> = props => {
  const { dispatch, children, settings, authRoutes } = props;
  /**
   * use Authorized check all menu item
   */
  const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] => {
    return menuList.map(item => {
      const localItem = {
        ...item,
        name: item.alias,
        children: item.children ? menuDataRender(item.children) : [],
      };
      if (MyConfig.menuType === 'i18n') {
        localItem.name = formatMessage({
          id: `menu.${item.name}`,
          defaultMessage: item.name,
        });
      } else {
        localItem.name = item.htmlName;
      }
      return Authorized.check(item.authority, localItem, null) as MenuDataItem;
    });
  };

  useState(() => {
    if (dispatch) {
      dispatch({
        type: 'settings/getSetting',
      });
    }
  });

  /**
   * init variables
   */
  const handleMenuCollapse = (payload: boolean): void => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsedReducers',
        payload,
      });
    }
  };

  return (
    <>
      <ProLayout
        logo={logo}
        onCollapse={handleMenuCollapse}
        onMenuHeaderClick={e => {
          e.preventDefault();
        }}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (menuItemProps.isUrl) {
            return defaultDom;
          }
          return <Link to={menuItemProps.path}>{defaultDom}</Link>;
        }}
        breadcrumbRender={(routers = []) => [
          // {
          //   path: '/',
          //   breadcrumbName: formatMessage({
          //     id: 'menu.home',
          //     defaultMessage: 'Home',
          //   }),
          // },
          // ...routers,
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
        menuDataRender={() => menuDataRender(authRoutes as MenuDataItem[])}
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

export default connect(({ global, auth, settings }: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
  authRoutes: auth.authRoutes,
}))(BasicLayout);
