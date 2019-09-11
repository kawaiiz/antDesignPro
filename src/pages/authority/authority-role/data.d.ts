export interface Role {
  roleId?: number | null, // id
  roleName?: string, // 名称
  roleDescription?: string, // 描述
  resourceIds?: (void | number)[] // 权限数组
}