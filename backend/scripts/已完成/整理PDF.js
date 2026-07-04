const fs = require('fs');
const path = require('path');

const base = path.join('E:', 'website', '1.my-first-website', 'docs', '原始素材');
const skip = path.join(base, '_非术语素材_已移出');

// 创建移出文件夹
if (!fs.existsSync(skip)) fs.mkdirSync(skip, { recursive: true });

// 需要移出的文件：10(扫描版与7重复)、12/14/15(非术语类)
const toMove = [
  '10.控制论与科学方法论_扫描版.pdf',
  '12.个人知识库搭建指南.pdf',
  '14.iPhone全维度拆解手册.pdf',
  '15.uni-app开发指南.pdf'
];

let moved = 0;
for (const f of toMove) {
  const src = path.join(base, f);
  const dst = path.join(skip, f);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dst);
    console.log('移出: ' + f);
    moved++;
  } else {
    console.log('不存在: ' + f);
  }
}

// 也移出辅助文件
const auxFiles = ['pdf9_remaining.txt', '_extracted'];
for (const f of auxFiles) {
  const src = path.join(base, f);
  const dst = path.join(skip, f);
  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      fs.renameSync(src, dst);
    } else {
      fs.renameSync(src, dst);
    }
    console.log('移出辅助: ' + f);
    moved++;
  }
}

console.log('\n共移出 ' + moved + ' 个文件/目录');

// 显示整理后的目录
console.log('\n=== 整理后的原始素材目录 ===');
const remaining = fs.readdirSync(base).filter(f => !f.startsWith('_'));
remaining.forEach(f => {
  const fp = path.join(base, f);
  const s = fs.statSync(fp);
  const size = s.isFile() ? (s.size / 1024 / 1024).toFixed(1) + 'MB' : '[目录]';
  console.log(size + '  ' + f);
});
