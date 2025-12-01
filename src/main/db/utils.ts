/**
 * 数据库工具函数
 */
import Database from 'better-sqlite3'

/**
 * 转义 SQL LIKE 模式中的特殊字符
 */
export function escapeLikePattern(pattern: string): string {
  return pattern.replace(/[%_]/g, '\\$&')
}

/**
 * 安全地构建 LIKE 查询条件
 */
export function buildLikeCondition(
  field: string,
  pattern: string,
  position: 'start' | 'end' | 'contains' = 'contains'
): { condition: string; value: string } {
  const escaped = escapeLikePattern(pattern)

  let value: string
  switch (position) {
    case 'start':
      value = `${escaped}%`
      break
    case 'end':
      value = `%${escaped}`
      break
    case 'contains':
    default:
      value = `%${escaped}%`
      break
  }

  return {
    condition: `${field} LIKE ?`,
    value
  }
}

/**
 * 将驼峰命名转换为下划线命名
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

/**
 * 将下划线命名转换为驼峰命名
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 将对象的键从驼峰转为下划线
 */
export function objectToSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value
  }
  return result
}

/**
 * 将对象的键从下划线转为驼峰
 */
export function objectToCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value
  }
  return result
}

/**
 * 执行数据库备份
 */
export function backupDatabase(db: Database.Database, backupPath: string): void {
  db.backup(backupPath)
}

/**
 * 获取数据库统计信息
 */
export function getDatabaseStats(db: Database.Database): {
  pageCount: number
  pageSize: number
  freePages: number
  totalSize: number
} {
  const pageCount = db.pragma('page_count', { simple: true }) as number
  const pageSize = db.pragma('page_size', { simple: true }) as number
  const freePages = db.pragma('freelist_count', { simple: true }) as number

  return {
    pageCount,
    pageSize,
    freePages,
    totalSize: pageCount * pageSize
  }
}

/**
 * 执行数据库 VACUUM 优化
 */
export function vacuumDatabase(db: Database.Database): void {
  db.exec('VACUUM')
}

/**
 * 执行数据库分析以优化查询计划
 */
export function analyzeDatabase(db: Database.Database, tableName?: string): void {
  if (tableName) {
    db.exec(`ANALYZE ${tableName}`)
  } else {
    db.exec('ANALYZE')
  }
}

/**
 * 检查数据库完整性
 */
export function checkDatabaseIntegrity(db: Database.Database): boolean {
  const result = db.pragma('integrity_check', { simple: true })
  return result === 'ok'
}

/**
 * 格式化时间戳为 SQLite 日期时间字符串
 */
export function timestampToSQLiteDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toISOString().replace('T', ' ').substring(0, 19)
}

/**
 * 将 SQLite 日期时间字符串转换为时间戳
 */
export function sqliteDateTimeToTimestamp(dateTimeStr: string): number {
  return new Date(dateTimeStr).getTime()
}
