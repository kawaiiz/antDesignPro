import React, { useEffect, useState } from 'react'
import { MenuDataItem } from '@ant-design/pro-layout';
import { connect } from 'dva';
import PageLoading from '@/components/PageLoading';
import { router } from 'umi';
import { ConnectState, ConnectProps } from '@/models/connect';
import { MyConfig } from 'config'

interface GoToHomeProps extends ConnectProps {
  authRoutes: MenuDataItem[],
}

const GoToHome: React.FC<GoToHomeProps> = props => {
  const { authRoutes } = props

  const [goToPath, setGoToPath] = useState('')
  const setHomePath = (authRoutes: MenuDataItem[]) => {
    if (authRoutes.length > 0) {
      for (let i = 0; i < authRoutes.length; i++) {
        if (authRoutes[i].own) {
          MyConfig.HOME_PATH = authRoutes[i].path
          setGoToPath(authRoutes[i].path)
          return
        }
      }
      setGoToPath('/user/login')
    }
  }

  useEffect(() => {
    setHomePath(authRoutes)
  }, [authRoutes])

  useEffect(() => {
    if (goToPath) {
      console.log(goToPath, '前往的页面')
      console.log(authRoutes)
      
      router.replace({
        pathname: goToPath,
      });
    }
  }, [goToPath])

  return <PageLoading />;
}

export default connect(({ auth }: ConnectState) => ({
  authRoutes: auth.authRoutes,
}))(GoToHome);