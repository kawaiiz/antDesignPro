import { Role } from '@/pages/authority/authority-role/data'


export interface Person {
  "iconUrl"?: string,
  "password"?: string,
  "phoneNumber"?: string,
  "roles"?: number[] | Role[] | string[], // 权限数组
  "roleId"?: number,// 权限id 表单填入使用 到提交 转成数组 
  "roleIds"?: number[], // 权限id  上传使用 后端改成一个人多身份 所以这里变成数组了 
  "userId"?: number, // 请求的时候要把 id变成userId
  "id"?: number, //  后台给的数据会给id
  "username"?: string
} 