import { IRoute } from 'umi-types/config'

let _publicRoute: IRoute[] = [
  {
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
  }
]

let _contentRoute: IRoute[] = [
  {
    path: '/',
    redirect: '/home',
  }, {
    path: '/home',
    name: 'home',
    icon: 'smile',
    component: './content/home/index',
    Routes: ['src/pages/Authorized'],
    // authority: ['admin', 'user', 'systemAdmin'],
  },
  {
    path: '/authority',
    name: 'authority',
    component: './authority/authority-tree/index',
    Routes: ['src/pages/Authorized'],
    // authority: ['systemAdmin'],
  }]

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
        authority: ['admin', 'user', 'systemAdmin'],
        routes: [],
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

// 获取最新的路由树
// const getRoute = async () => {
//   try {
//     if (_contentRoute.length === 1) {
//       let res = await getRouteTree()
//       _contentRoute = _contentRoute.concat(res.data)
//     }
//     return _contentRoute
//   } catch (e) {
//     console.log(e)
//     return _contentRoute
//   }
// }

// 内部更新路由树
const _setRoute = () => {
  // routes[1].routes[0].routes = routes[1].routes[0].routes.concat(await getRoute())
  routes[1].routes[0].routes = _publicRoute.concat(_contentRoute)
  console.log(routes[1].routes[0])
}
//初始化一下
_setRoute()

const setRoute = (newContentRoute: IRoute[]) => {
  console.log(newContentRoute)
  let contentRoute: IRoute[] = [{
    path: '/',
    redirect: '/home',
  }]
  contentRoute = contentRoute.concat(newContentRoute)
  _contentRoute = contentRoute
  console.log(_contentRoute)
  //初始化一下
  _setRoute()
}

export default routes
export {
  setRoute
}




