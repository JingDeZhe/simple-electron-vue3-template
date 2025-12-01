import Database from 'better-sqlite3'

export interface QueryBuilder {
  table: string
  select?: string[]
  where?: Array<{ field: string; value: any }>
  orderBy?: Array<{ field: string; direction: 'ASC' | 'DESC' }>
  limit?: number
  offset?: number
}

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

export function executePaginatedQuery<T>(
  db: Database.Database,
  query: string,
  params: any[],
  page: number = 1,
  pageSize: number = 10
): { data: T[]; total: number; page: number; pageSize: number } {
  const countQuery = `SELECT COUNT(*) as total FROM (${query})`
  const countResult = db.prepare(countQuery).get(...params) as { total: number }

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

// 使用事务确保批量插入的原子性
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

export function tableExists(db: Database.Database, tableName: string): boolean {
  const result = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
    .get(tableName)
  return !!result
}

export function getTableColumns(db: Database.Database, tableName: string): string[] {
  const result = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>
  return result.map((r) => r.name)
}
