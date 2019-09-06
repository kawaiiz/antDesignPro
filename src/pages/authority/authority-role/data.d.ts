export interface Role {
  id?: number | null,
  name?: string,
  auth?: (void | number)[]
}