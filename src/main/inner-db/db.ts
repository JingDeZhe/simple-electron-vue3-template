/**
 * 内部数据库
 */
import Database from 'better-sqlite3'
// 注意引用resources里的sqlite文件需要添加?asset&asarUnpack后缀
import innerDBPath from '../../../resources/inner.sqlite?asset&asarUnpack'

export interface InnerDataInfo {
  version: number
  updated_at: number
}

export interface DatabaseTestResult {
  version: string // SQLite版本号
  fts5Enabled: boolean // 是否支持FTS5
  json1Enabled: boolean // 是否支持JSON1
  connectionStatus: 'success' | 'failure' // 连接状态
  error?: string // 错误信息（如果有）
}

class InnerData {
  private db: Database.Database

  constructor() {
    // 初始化数据库连接
    this.db = new Database(innerDBPath)
    this.db.pragma('journal_mode = WAL') // 更好的并发性能

    // 创建版本表用于管理数据库版本
    this.initializeVersionTable()
  }

  private initializeVersionTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS db_version (
        version INTEGER PRIMARY KEY,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO db_version (version) SELECT 0 WHERE NOT EXISTS (SELECT 1 FROM db_version);
    `)
  }

  public getDatabase(): Database.Database {
    return this.db
  }

  public migrate(version: number, migrationScript: string): void {
    const currentVersion = this.getCurrentVersion()
    if (version > currentVersion) {
      this.db.transaction(() => {
        this.db.exec(migrationScript)
        this.db
          .prepare('UPDATE db_version SET version = ?, updated_at = CURRENT_TIMESTAMP')
          .run(version)
      })()
    }
  }

  private getCurrentVersion(): number {
    const row = this.db.prepare('SELECT version FROM db_version').get() as InnerDataInfo
    return row ? row.version : 0
  }

  public close(): void {
    this.db?.close()
  }

  /**
   * 测试数据库连接和功能支持
   * @returns 数据库测试结果
   */
  public testDatabase(): DatabaseTestResult {
    const result: DatabaseTestResult = {
      version: '',
      fts5Enabled: false,
      json1Enabled: false,
      connectionStatus: 'success'
    }

    try {
      // 1. 获取SQLite版本
      const versionRow = this.db.prepare('SELECT sqlite_version() AS version').get() as {
        version: string
      }
      result.version = versionRow.version

      // 2. 检查FTS5支持
      try {
        // 尝试使用FTS5创建虚拟表
        this.db.exec('CREATE VIRTUAL TABLE IF NOT EXISTS test_fts5 USING fts5(content)')
        result.fts5Enabled = true
        // 清理测试表
        this.db.exec('DROP TABLE IF EXISTS test_fts5')
      } catch {
        result.fts5Enabled = false
      }

      // 3. 检查JSON1支持
      try {
        // 尝试使用json函数
        const jsonRow = this.db.prepare('SELECT json(\'{"key": "value"}\') AS jsonTest').get() as {
          jsonTest: any
        }
        if (typeof jsonRow.jsonTest === 'string') {
          result.json1Enabled = true
        }
      } catch {
        result.json1Enabled = false
      }
    } catch (error: any) {
      result.connectionStatus = 'failure'
      result.error = error.message
    }

    return result
  }
}

export const innerData = new InnerData()
