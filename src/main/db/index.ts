import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import type { AIConfig, CreateAIConfigInput, UpdateAIConfigInput } from '@shared/type'
import initSQL from './init.sql?raw'
import { getUid } from '@shared/utils'

class AIConfigDB {
  private db: Database.Database | null = null

  private getDB(): Database.Database {
    if (!this.db) {
      const userDataPath = app.getPath('userData')
      const dbPath = join(userDataPath, 'main.db')
      this.db = new Database(dbPath)
      this.db.pragma('journal_mode = WAL') // 启用 WAL 模式提高并发性能
      this.initTable()
    }
    return this.db
  }

  private initTable(): void {
    this.getDB().exec(initSQL)
  }

  create(input: CreateAIConfigInput): AIConfig {
    const db = this.getDB()
    const now = Date.now()
    const id = getUid()

    // 确保同一时间只有一个默认配置
    if (input.isDefault) {
      this.clearDefaultConfig()
    }

    const stmt = db.prepare(`
      INSERT INTO ai_configs (
        id, name, base_url, api_key, model, temperature, max_tokens,
        top_p, frequency_penalty, presence_penalty, is_default, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      input.name,
      input.baseURL,
      input.apiKey,
      input.model || null,
      input.temperature !== undefined ? input.temperature : null,
      input.maxTokens !== undefined ? input.maxTokens : null,
      input.topP !== undefined ? input.topP : null,
      input.frequencyPenalty !== undefined ? input.frequencyPenalty : null,
      input.presencePenalty !== undefined ? input.presencePenalty : null,
      input.isDefault ? 1 : 0,
      now,
      now
    )

    return this.findById(id)!
  }

  findById(id: string): AIConfig | undefined {
    const stmt = this.getDB().prepare('SELECT * FROM ai_configs WHERE id = ?')
    const row = stmt.get(id) as any

    return row ? this.mapRowToConfig(row) : undefined
  }

  findAll(): AIConfig[] {
    const stmt = this.getDB().prepare('SELECT * FROM ai_configs ORDER BY created_at DESC')
    const rows = stmt.all() as any[]

    return rows.map((row) => this.mapRowToConfig(row))
  }

  findDefault(): AIConfig | undefined {
    const stmt = this.getDB().prepare('SELECT * FROM ai_configs WHERE is_default = 1 LIMIT 1')
    const row = stmt.get() as any

    return row ? this.mapRowToConfig(row) : undefined
  }

  update(input: UpdateAIConfigInput): AIConfig | undefined {
    const db = this.getDB()
    const existing = this.findById(input.id)
    if (!existing) {
      return undefined
    }

    const now = Date.now()

    // 确保同一时间只有一个默认配置
    if (input.isDefault) {
      this.clearDefaultConfig()
    }

    const updates: string[] = []
    const values: any[] = []

    if (input.name !== undefined) {
      updates.push('name = ?')
      values.push(input.name)
    }
    if (input.baseURL !== undefined) {
      updates.push('base_url = ?')
      values.push(input.baseURL)
    }
    if (input.apiKey !== undefined) {
      updates.push('api_key = ?')
      values.push(input.apiKey)
    }
    if (input.model !== undefined) {
      updates.push('model = ?')
      values.push(input.model)
    }
    if (input.temperature !== undefined) {
      updates.push('temperature = ?')
      values.push(input.temperature)
    }
    if (input.maxTokens !== undefined) {
      updates.push('max_tokens = ?')
      values.push(input.maxTokens)
    }
    if (input.topP !== undefined) {
      updates.push('top_p = ?')
      values.push(input.topP)
    }
    if (input.frequencyPenalty !== undefined) {
      updates.push('frequency_penalty = ?')
      values.push(input.frequencyPenalty)
    }
    if (input.presencePenalty !== undefined) {
      updates.push('presence_penalty = ?')
      values.push(input.presencePenalty)
    }
    if (input.isDefault !== undefined) {
      updates.push('is_default = ?')
      values.push(input.isDefault ? 1 : 0)
    }

    updates.push('updated_at = ?')
    values.push(now)

    values.push(input.id)

    const stmt = db.prepare(`
      UPDATE ai_configs SET ${updates.join(', ')} WHERE id = ?
    `)

    stmt.run(...values)

    return this.findById(input.id)
  }

  delete(id: string): boolean {
    const stmt = this.getDB().prepare('DELETE FROM ai_configs WHERE id = ?')
    const result = stmt.run(id)

    return result.changes > 0
  }

  private clearDefaultConfig(): void {
    const stmt = this.getDB().prepare('UPDATE ai_configs SET is_default = 0 WHERE is_default = 1')
    stmt.run()
  }

  private mapRowToConfig(row: any): AIConfig {
    return {
      id: row.id,
      name: row.name,
      baseURL: row.base_url,
      apiKey: row.api_key,
      model: row.model,
      temperature: row.temperature,
      maxTokens: row.max_tokens,
      topP: row.top_p,
      frequencyPenalty: row.frequency_penalty,
      presencePenalty: row.presence_penalty,
      isDefault: row.is_default === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  close(): void {
    this.db?.close()
    this.db = null
  }
}

export const aiConfigDB = new AIConfigDB()
