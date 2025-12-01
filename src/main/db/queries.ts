/**
 * 数据库查询辅助函数
 */
import Database from 'better-sqlite3'

/**
 * 查询构建器接口
 */
export interface QueryBuilder {
  table: string
  select?: string[]
  where?: Array<{ field: string; value: any }>
  orderBy?: Array<{ field: string; direction: 'ASC' | 'DESC' }>
  limit?: number
  offset?: number
}

/**
 * 构建 SELECT 查询
 */
export function buildSelectQuery(builder: QueryBuilder): string {
  const { table, select, where, orderBy, limit, offset } = builder

  let query = `SELECT ${select?.join(', ') || '*'} FROM ${table}`

  if (where && where.length > 0) {
    const conditions = where.map((w) => `${w.field} = ?`).join(' AND ')
    query += ` WHERE ${conditions}`
  }

  if (orderBy && orderBy.length > 0) {
    const orders = orderBy.map((o) => `${o.field} ${o.direction}`).join(', ')
    query += ` ORDER BY ${orders}`
  }

  if (limit !== undefined) {
    query += ` LIMIT ${limit}`
  }

  if (offset !== undefined) {
    query += ` OFFSET ${offset}`
  }

  return query
}

/**
 * 执行分页查询
 */
export function executePaginatedQuery<T>(
  db: Database.Database,
  query: string,
  params: any[],
  page: number = 1,
  pageSize: number = 10
): { data: T[]; total: number; page: number; pageSize: number } {
  // 获取总数
  const countQuery = `SELECT COUNT(*) as total FROM (${query})`
  const countResult = db.prepare(countQuery).get(...params) as { total: number }

  // 获取分页数据
  const offset = (page - 1) * pageSize
  const paginatedQuery = `${query} LIMIT ? OFFSET ?`
  const data = db.prepare(paginatedQuery).all(...params, pageSize, offset) as T[]

  return {
    data,
    total: countResult.total,
    page,
    pageSize
  }
}

/**
 * 批量插入数据
 */
export function batchInsert(
  db: Database.Database,
  table: string,
  columns: string[],
  rows: any[][]
): number {
  const placeholders = columns.map(() => '?').join(', ')
  const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`

  const insert = db.prepare(query)
  const transaction = db.transaction((rows: any[][]) => {
    for (const row of rows) {
      insert.run(...row)
    }
  })

  transaction(rows)
  return rows.length
}

/**
 * 检查表是否存在
 */
export function tableExists(db: Database.Database, tableName: string): boolean {
  const result = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
    .get(tableName)
  return !!result
}

/**
 * 获取表的所有列名
 */
export function getTableColumns(db: Database.Database, tableName: string): string[] {
  const result = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>
  return result.map((r) => r.name)
}
