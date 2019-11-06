import { IConfig, IPlugin } from 'umi-types';
import defaultSettings from './defaultSettings'; // https://umijs.org/config/
import routes from './config.router'
import slash from 'slash2';
import webpackPlugin from './plugin.config';

const path = require('path')

const resolve = (dir: string) => {
  return path.resolve(__dirname, dir)
}

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
      // dynamicImport: {
      //   loadingComponent: './components/PageLoading/index',
      //   webpackChunkName: true,
      //   level: 3,
      // },
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


// baseurl 本地域名 在线域名
// footerContent 底部关于公司的文本
// cookieExpires cookie过期时间 本项目用的localStorage
// token token的字段名
// refreshToken 重置token用的refreshToken的字段名
// upImgFileUrl 上传文件的地址
// meauType 左边菜单是i18ny文字还是原文字
interface footerContentLinks {
  key: string,
  title: string,
  href: string,
  blankTarget: boolean
}

interface MyConfigInterFace {
  baseUrl: {
    dev: string,
    pro: string
  },
  footerContent: {
    links: footerContentLinks[],
    copyright: string,
  },
  cookieExpires: number,
  token: string,
  refreshToken: string,
  upImgFileUrl: string,
  menuType: 'i18n' | 'text',
  [key: string]: any,
  SUPER_ADMIN: string,
  HOME_PATH: string
}

export const MyConfig: MyConfigInterFace = {
  // 请求的域名
  baseUrl: {
    dev: 'http://192.168.1.222:8080',
    // dev: 'http://192.168.1.74:3001',
    // dev: '',
    pro: 'http://192.168.1.222:8080',
  },
  // 底部的文字
  footerContent: {
    links: [],
    copyright: '南京途酷科技有限公司',
  },
  // cookie过期时间（天）
  cookieExpires: 7,
  // token 名称
  token: 'token',
  refreshToken: 'refreshToken',
  upImgFileUrl: '/api/web/file/img',
  // menuType: 'text'
  menuType: 'i18n',
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOME_PATH: '/home'
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
  // 默认是 browser
  history: 'hash',
  // 路由
  routes,
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
  alias: {
    config: resolve('config.ts')
  },
  chainWebpack: webpackPlugin,
  // proxy: {
  //   '/api': 'http://192.168.1.222:8080'
  // }
} as IConfig;
