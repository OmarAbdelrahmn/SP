const { execSync } = require('child_process');
const fs = require('fs');

const committed = execSync('git show 3d56d79:src/utils/defaultTemplates.ts', { encoding: 'utf8' });
const current = fs.readFileSync('src/utils/defaultTemplates.ts', 'utf8');

function extractFields(str) {
  const lines = str.split('\n');
  const res = [];
  let curId = '', curName = '';
  lines.forEach(l => {
    if (l.includes("id: '")) curId = l.trim();
    if (l.includes("name: '")) curName = l.trim();
    if (l.includes("fontSize:")) {
      res.push({ id: curId, name: curName, size: l.trim() });
    }
  });
  return res;
}

const cFields = extractFields(committed);
const curFields = extractFields(current);

console.log('Committed vs Current (First 35 fields):');
for (let i = 0; i < Math.min(35, curFields.length); i++) {
  console.log(curFields[i].id, '| Committed:', cFields[i]?.size, '-> Current:', curFields[i]?.size);
}
