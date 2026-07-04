const fs = require('fs');
const path = require('path');

const base = path.join('E:', 'website', '1.my-first-website', 'docs', '原始素材');

// 检查所有文件（包括可能编码不同的）
console.log('=== 原始素材目录所有文件 ===');
const all = fs.readdirSync(base);
all.forEach(f => {
  const fp = path.join(base, f);
  const s = fs.statSync(fp);
  console.log(JSON.stringify(f) + '  ' + (s.isFile() ? (s.size/1024/1024).toFixed(1)+'MB' : '[dir]'));
});

console.log('\n=== _非术语素材_已移出 ===');
const skip = path.join(base, '_非术语素材_已移出');
if (fs.existsSync(skip)) {
  const moved = fs.readdirSync(skip);
  moved.forEach(f => {
    const fp = path.join(skip, f);
    const s = fs.statSync(fp);
    console.log(JSON.stringify(f) + '  ' + (s.isFile() ? (s.size/1024/1024).toFixed(1)+'MB' : '[dir]'));
  });
}
