/* 
  对这里的代码做下解释
  为实现后台传入路由的权限
  根据下面这个例子
  从而写出了这个乱七八糟的代码
  https://github.com/ant-design/ant-design-pro/issues/4286
  第一 所有的路由要先在代码里定义好（因为路由的component需要在开始的时候初始化），可以不带权限字段
  第二 在src/models/global里请求权限列表(函数getRouteTree)：interface IRoute[],这里请求的路由是完整的带权限的路由，
  第三 那获得的完整路由去src/layouts/basicLayout 找到basicLayout函数构造，开始的addroute ,useState ,useEffect 是 注入新路由的
  第四 src/layouts/basicLayout 里的 setIi8Menu 是控制全球化文字的函数，动态列表貌似不支持全球化，只能通过函数插入
*/

import { IRoute } from 'umi-types/config'

export const contentRoutes: IRoute[] = [{
  path: '/home',
  name: 'home',
  icon: 'smile',
  component: './content/home/index',
},
{
  path: '/authority',
  name: 'authority',
  icon: ' ',
  routes: [
    {
      path: '/authority',
      redirect: '/authority/role',
    },
    {
      path: '/authority/tree',
      name: 'authority-tree',
      icon: ' ',
      component: './authority/authority-tree/index',
    }, {
      path: '/authority/role',
      name: 'authority-role',
      icon: ' ',
      component: './authority/authority-role/index',
    }, {
      path: '/authority/person',
      name: 'authority-person',
      icon: ' ',
      component: './authority/authority-person/index',
    }],
},
]

const routes: IRoute[] = [
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/login',
        hideInMenu: true,
      },
      {
        name: 'register',
        path: '/user/register',
        component: './user/register',
        hideInMenu: true,
      },
      {
        name: 'register-result',
        path: '/user/register-result',
        component: './user/register-result',
        hideInMenu: true,
      },
      {
        name: 'reset-password',
        path: '/user/reset-password',
        component: './user/reset-password',
        hideInMenu: true,
      },
    ],
  },
  {
    path: '/',
    component: '../layouts/SecurityLayout',
    routes: [
      {
        path: '/',
        component: '../layouts/BasicLayout',
        Routes: ['src/pages/Authorized'],
        routes: [{
          path: '/',
          redirect: '/home',
        }, {
          name: '404',
          path: '/error-page/404',
          component: './error-page/404/index',
          hideInMenu: true,
        },
        {
          name: '403',
          path: '/error-page/403',
          component: './error-page/403/index',
          hideInMenu: true,
        },
        {
          name: '500',
          path: '/error-page/500',
          component: './error-page/500/index',
          hideInMenu: true,
        },
        ],
      },
      {
        component: './error-page/404/index',
      },
    ],
  },
  {
    component: './error-page/403/index',
  },
  {
    component: './error-page/404/index',
  },
  {
    component: './error-page/404/index',
  },
]

routes[1].routes[0].routes = routes[1].routes[0].routes.concat(contentRoutes)

export default routes



