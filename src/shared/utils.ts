import { v7 } from 'uuid'
import { cloneDeep } from 'es-toolkit'

export const getUid = () => {
  return v7()
}

/**获取原生对象，避免与electron通信时报响应对象无法克隆的错误 */
export const toDeepRaw: <T>(v: T) => T = (v) => cloneDeep(v)
