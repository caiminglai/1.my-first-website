/**
 * 数据备份脚本
 * 用法: node scripts/backup.js
 * 
 * 功能:
 * 1. 复制数据库文件到备份目录
 * 2. 保留最近30天的备份
 * 3. 可加到定时任务（crontab）每天自动执行
 * 
 * crontab 示例（每天凌晨3点备份）:
 * 0 3 * * * cd /path/to/backend && node scripts/backup.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, '同物异名.db');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const MAX_BACKUP_DAYS = 30; // 保留30天

// 确保备份目录存在
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 生成备份文件名
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupPath = path.join(BACKUP_DIR, `backup_${timestamp}.db`);

// 复制数据库
fs.copyFileSync(DB_PATH, backupPath);

// 获取文件大小
const size = fs.statSync(backupPath).size;
console.log(`[BACKUP] 备份成功: ${backupPath}`);
console.log(`[BACKUP] 文件大小: ${(size / 1024).toFixed(1)} KB`);

// 清理旧备份
const files = fs.readdirSync(BACKUP_DIR)
  .filter((f) => f.endsWith('.db'))
  .map((f) => ({
    name: f,
    path: path.join(BACKUP_DIR, f),
    mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime,
  }))
  .sort((a, b) => b.mtime - a.mtime);

const cutoffDate = new Date(now - MAX_BACKUP_DAYS * 24 * 60 * 60 * 1000);
let deleted = 0;

for (const file of files) {
  if (file.mtime < cutoffDate) {
    fs.unlinkSync(file.path);
    deleted++;
  }
}

if (deleted > 0) {
  console.log(`[BACKUP] 清理旧备份: 删除 ${deleted} 个文件`);
}

console.log(`[BACKUP] 当前保留: ${files.length - deleted} 个备份`);
