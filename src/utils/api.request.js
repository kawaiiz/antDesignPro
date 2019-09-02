import HttpRequest from '@/utils/axios'
import { MyConfig } from '../../config/config'

const baseUrl = process.env.NODE_ENV !== 'production' ? MyConfig.baseUrl.dev : MyConfig.baseUrl.pro


const axios = new HttpRequest(baseUrl)
export default axios
