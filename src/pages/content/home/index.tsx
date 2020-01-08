import React from 'react'
import { Typography, Divider, Card } from 'antd'
const { Title, Paragraph, Text } = Typography;

class Home extends React.Component {
  render() {
    return <Card>
      <Typography>
        <Title level={4}>介绍</Title>
        基于ant design pro的二次开发
      </Typography>
    </Card>
  }
}

export default Home