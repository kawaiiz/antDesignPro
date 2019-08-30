import { IConfig, IPlugin } from 'umi-types';
import defaultSettings from './defaultSettings'; // https://umijs.org/config/

import slash from 'slash2';
import webpackPlugin from './plugin.config';
const { pwa, primaryColor } = defaultSettings; // preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。

const { ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION } = process.env;
const isAntDesignProPreview = ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site';
const plugins: IPlugin[] = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      locale: {
        // default false
        enable: true,
        // default zh-CN
        default: 'zh-CN',
        // default true, when it is true, will use `navigator.language` overwrite default
        baseNavigator: true,
      },
      dynamicImport: {
        loadingComponent: './components/PageLoading/index',
        webpackChunkName: true,
        level: 3,
      },
      pwa: pwa
        ? {
          workboxPluginMode: 'InjectManifest',
          workboxOptions: {
            importWorkboxFrom: 'local',
          },
        }
        : false, // default close dll, because issue https://github.com/ant-design/ant-design-pro/issues/4665
      // dll features https://webpack.js.org/plugins/dll-plugin/
      // dll: {
      //   include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch'],
      //   exclude: ['@babel/runtime', 'netlify-lambda'],
      // },
    },
  ],
  [
    'umi-plugin-pro-block',
    {
      moveMock: false,
      moveService: false,
      modifyRequest: true,
      autoAddMenu: true,
    },
  ],
]; // 针对 preview.pro.ant.design 的 GA 统计代码

export const MyConfig = {
  baseUrl: {
    // dev: 'http://192.168.1.74:3001',
    dev: '',
    pro: 'http://192.168.1.74:3001',
  },
  footerContent: {
    links: [],
    copyright: '南京途酷科技有限公司',
  },
};
export default {
  base: '/',
  publicPath: '/',
  plugins,
  block: {
    // 国内用户可以使用码云
    // defaultGitUrl: 'https://gitee.com/ant-design/pro-blocks',
    defaultGitUrl: 'https://github.com/ant-design/pro-blocks',
  },
  hash: true,
  targets: {
    ie: 11,
  },
  devtool: isAntDesignProPreview ? 'source-map' : false,
  // umi routes: https://umijs.org/zh/guide/router.html
  history: 'hash',
  // 默认是 browser
  routes: [
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
      Routes: ['src/pages/Authorized'],
      authority: ['admin', 'user'],
      routes: [
        {
          path: '/',
          component: '../layouts/BasicLayout',
          Routes: ['src/pages/Authorized'],
          authority: ['admin', 'user'],
          routes: [
            {
              path: '/',
              redirect: '/home',
            },
            {
              path: '/home',
              name: 'home',
              icon: 'smile',
              authority: ['admin', 'user'],
              component: './content/first/first',
            },
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
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': primaryColor,
  },
  define: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION:
      ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION || '', // preview.pro.ant.design only do not use in your production ; preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。
  },
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableRedirectHoist: true,
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (
      context: {
        resourcePath: string;
      },
      _: string,
      localName: string
    ) => {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('ant.design.pro.less') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }

      const match = context.resourcePath.match(/src(.*)/);

      if (match && match[1]) {
        const antdProPath = match[1].replace('.less', '');
        const arr = slash(antdProPath)
          .split('/')
          .map((a: string) => a.replace(/([A-Z])/g, '-$1'))
          .map((a: string) => a.toLowerCase());
        return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }

      return localName;
    },
  },
  manifest: {
    basePath: '/',
  },
  chainWebpack: webpackPlugin,
  /*   proxy: {
      '/api': {
        target: '',
        changeOrigin: true,
        pathRewrite: {
          '^/123456': '',
        },
      },
    }, */
} as IConfig;
