import Database from 'better-sqlite3'

// 转义 SQL LIKE 模式中的特殊字符，防止注入攻击
export function escapeLikePattern(pattern: string): string {
  return pattern.replace(/[%_]/g, '\\$&')
}

// 安全地构建 LIKE 查询条件，自动转义用户输入
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

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

export function objectToSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value
  }
  return result
}

export function objectToCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value
  }
  return result
}

export function backupDatabase(db: Database.Database, backupPath: string): void {
  db.backup(backupPath)
}

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

// 回收空闲页面，减小数据库文件体积
export function vacuumDatabase(db: Database.Database): void {
  db.exec('VACUUM')
}

// 更新表统计信息，帮助查询优化器选择更好的执行计划
export function analyzeDatabase(db: Database.Database, tableName?: string): void {
  if (tableName) {
    db.exec(`ANALYZE ${tableName}`)
  } else {
    db.exec('ANALYZE')
  }
}

export function checkDatabaseIntegrity(db: Database.Database): boolean {
  const result = db.pragma('integrity_check', { simple: true })
  return result === 'ok'
}

export function timestampToSQLiteDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toISOString().replace('T', ' ').substring(0, 19)
}

export function sqliteDateTimeToTimestamp(dateTimeStr: string): number {
  return new Date(dateTimeStr).getTime()
}
