import router from 'umi/router';
import Link from 'umi/link';
import { Result, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import { formatMessage } from 'umi-plugin-react/locale';

const error404: React.FC = props => {
  const [num, setNum] = useState(5)
  useEffect(() => {
    const Times = setInterval(() => {
      if (num > 0) {
        setNum(num - 1)
      } else {
        clearInterval(Times)
        router.goBack()
      }
    }, 1000)
    return () => {
      clearInterval(Times)
    }
  });
  return (
    <Result
      status="404"
      title="404"
      style={{
        background: 'none',
      }}
      subTitle={formatMessage({
        id: 'error-page-404.description.404',
        defaultMessage: "Sorry, you don't have access to this page.",
      })}
      extra={
        (
          <>
            <div>{num}秒后返回上一页</div>
            <Link to="/">
              <Button type="primary">
                {formatMessage({ id: 'error-page-404.exception.back', defaultMessage: 'Back Home' })}
              </Button>
            </Link>
          </>
        )
      }
    />
  );
}

export default error404
