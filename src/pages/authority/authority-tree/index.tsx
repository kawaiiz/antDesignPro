import React from 'react'
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { getRoute } from '../../../../config/config.router'
export default () => {
  return (<PageHeaderWrapper content={<FormattedMessage id="authority-tree.header.description" />}>

  </PageHeaderWrapper>);
};