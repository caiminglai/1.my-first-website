const fs = require('fs');
const path = require('path');
const dir = path.join('E:', 'website', '1.my-first-website', 'docs', '原始素材');
const files = fs.readdirSync(dir);
files.forEach(f => {
  const fp = path.join(dir, f);
  const s = fs.statSync(fp);
  console.log((s.size / 1024 / 1024).toFixed(1) + 'MB  ' + f);
});
