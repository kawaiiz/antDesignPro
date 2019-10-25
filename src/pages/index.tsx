import React, { useEffect, useState } from 'react'
import { MenuDataItem } from '@ant-design/pro-layout';
import { connect } from 'dva';
import PageLoading from '@/components/PageLoading';
import { router } from 'umi';
import { ConnectState, ConnectProps } from '@/models/connect';
import { MyConfig } from 'config'

interface GoToHomeProps extends ConnectProps {
  authList: MenuDataItem[],
}

const GoToHome: React.FC<GoToHomeProps> = props => {
  const { authList } = props
  const [goToPath, setGoToPath] = useState('')
  const setHomePath = (authList: MenuDataItem[]) => {
    if (authList.length > 0) {
      for (let i = 0; i < authList.length; i++) {
        if (authList[i].own) {
          MyConfig.HOME_PATH = authList[i].path
          setGoToPath(authList[i].path)
          return
        }
      }
      setGoToPath('/user/login')
    }
  }

  useEffect(() => {
    setHomePath(authList)
  }, [authList])

  useEffect(() => {
    router.replace({
      pathname: goToPath,
    });
  }, [goToPath])

  return <PageLoading />;
}

export default connect(({ auth }: ConnectState) => ({
  authList: auth.authList,
}))(GoToHome);