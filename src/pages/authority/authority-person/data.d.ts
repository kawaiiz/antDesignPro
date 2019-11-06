import { Role } from '@/pages/authority/authority-role/data'


export interface Person {
  "iconUrl"?: string,
  "password"?: string,
  "phoneNumber"?: string,
  "roles"?: number | Role | Role[], // 权限数组
  "roleId"?: number, // 权限id  上传使用
  "userId"?: number, // 请求的时候要把 id变成userId
  "id"?: number, //  后台给的数据会给id
  "username"?: string
} 