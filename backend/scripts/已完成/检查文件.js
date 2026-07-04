const fs = require('fs');
const path = require('path');
const dir = 'C:\\Users\\Lcm\\.qoderworkcn\\workspace\\mqzafl2t29x6wiwd';
const files = ['data_经济学.js','data_数学.js','data_计算机.js','data_跨学科.js','data_物理补充.js','data_医学心理.js','data_法律政策.js','data_控制论.js','data_化学.js','data_生物学.js'];
for (const f of files) {
  const fp = path.join(dir, f);
  try {
    const s = fs.statSync(fp);
    console.log(Math.round(s.size/1024) + 'KB  ' + f);
  } catch(e) {
    console.log('不存在  ' + f);
  }
}
