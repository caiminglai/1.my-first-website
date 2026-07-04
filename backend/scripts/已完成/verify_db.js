const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join('E:', 'website', '1.my-first-website', 'data', '同物异名.db');
const db = new Database(dbPath, { readonly: true });

// Get all existing term names grouped by discipline
const rows = db.prepare('SELECT 学科, 名称 FROM 词条').all();
const existing = {};
for (const row of rows) {
  if (!existing[row.学科]) existing[row.学科] = new Set();
  existing[row.学科].add(row.名称);
}

console.log('Existing term counts from database:');
for (const [disc, set] of Object.entries(existing)) {
  console.log(`  ${disc}: ${set.size} terms`);
}

// Now verify each new data file
const wsDir = 'C:\\Users\\Lcm\\.qoderworkcn\\workspace\\mqzafl2t29x6wiwd';
const files = {
  '医学心理': path.join(wsDir, 'data_医学心理.js'),
  '法律政策': path.join(wsDir, 'data_法律政策.js'),
  '控制论': path.join(wsDir, 'data_控制论.js'),
  '化学': path.join(wsDir, 'data_化学.js'),
  '生物学': path.join(wsDir, 'data_生物学.js')
};

console.log('\n' + '='.repeat(60));
console.log('VERIFICATION OF NEW DATA FILES');
console.log('='.repeat(60));

let allOk = true;
for (const [disc, fname] of Object.entries(files)) {
  const content = fs.readFileSync(fname, 'utf-8');
  const nameMatches = [...content.matchAll(/name:\s*'([^']+)'/g)];
  const idMatches = [...content.matchAll(/id:\s*'([^']+)'/g)];
  
  const names = nameMatches.map(m => m[1]);
  const ids = idMatches.map(m => m[1]);
  
  console.log(`\n${disc}: ${names.length} entries, IDs: ${ids[0]} ~ ${ids[ids.length-1]}`);
  
  // Check internal duplicates
  const nameSet = new Set(names);
  if (nameSet.size !== names.length) {
    const dups = names.filter((n, i) => names.indexOf(n) !== i);
    console.log(`  WARNING: Internal duplicates: ${[...new Set(dups)].join(', ')}`);
    allOk = false;
  }
  
  // Check overlap with existing
  const existingSet = existing[disc] || new Set();
  const overlaps = names.filter(n => existingSet.has(n));
  if (overlaps.length > 0) {
    console.log(`  WARNING: Overlaps with existing: ${overlaps.join(', ')}`);
    allOk = false;
  } else {
    console.log(`  OK: No overlaps with existing terms (${existingSet.size} existing)`);
  }
  
  // Also check sub-names (parts before /)
  const subNames = new Set();
  for (const n of names) {
    for (const part of n.split('/')) {
      subNames.add(part.trim());
    }
  }
  const existingSubNames = new Set();
  for (const n of existingSet) {
    for (const part of n.split('/')) {
      existingSubNames.add(part.trim());
    }
  }
  const subOverlaps = [...subNames].filter(s => existingSubNames.has(s));
  if (subOverlaps.length > 0) {
    console.log(`  WARNING: Sub-name overlaps: ${subOverlaps.join(', ')}`);
    allOk = false;
  } else {
    console.log(`  OK: No sub-name overlaps`);
  }
}

console.log('\n' + '='.repeat(60));
if (allOk) {
  console.log('ALL FILES VERIFIED SUCCESSFULLY');
} else {
  console.log('ISSUES FOUND - see warnings above');
}

db.close();
