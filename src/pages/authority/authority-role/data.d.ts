export interface Role {
  roleId?: number | null, // id
  roleName?: string, // 名称
  roleDescription?: string, // 描述
  htmlIds?: (void | number)[] // 权限数组
}