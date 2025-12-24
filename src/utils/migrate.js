import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    const migrationFile = path.join(__dirname, '../../migrations/001_create_tables.sql');
    let sql = fs.readFileSync(migrationFile, 'utf8');
    
    // Remove SQL comments (-- style)
    sql = sql.replace(/--.*$/gm, '');
    
    // Split by semicolon and filter out empty statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement) {
        // Use query() instead of execute() for DDL statements and USE commands
        // Prepared statements don't support DDL or USE commands
        await pool.query(statement);
      }
    }
    
    console.log('✅ Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runMigrations();

