const fs = require('fs');

const schema = JSON.parse(fs.readFileSync('schema.json', 'utf8'));
const definitions = schema.definitions;

let er = 'erDiagram\n';
const tables = Object.keys(definitions);
const relations = [];

for (const [tableName, tableDef] of Object.entries(definitions)) {
  er += `  ${tableName} {\n`;
  if (tableDef.properties) {
    for (const [colName, colDef] of Object.entries(tableDef.properties)) {
      let type = colDef.format || colDef.type || 'string';
      type = type.replace(/[^a-zA-Z0-9_]/g, '_');
      er += `    ${type} ${colName}\n`;
      
      // Infer logic relationships
      if (colName.endsWith('_id')) {
        let parentTable = colName.replace('_id', 's');
        if (parentTable === 'owner_s') parentTable = 'profiles'; // custom logic
        if (parentTable === 'user_s') parentTable = 'profiles'; // custom logic
        if (parentTable === 'vet_s') parentTable = 'profiles'; // custom logic
        if (parentTable === 'clinic_s') parentTable = 'vet_clinics';
        
        if (tables.includes(parentTable)) {
          relations.push(`  ${parentTable} ||--o{ ${tableName} : "has"`);
        } else if (tables.includes(colName.replace('_id', ''))) { // e.g. pet_id -> pet? but table is probably pets
           // pass
        }
      }
    }
  }
  er += `  }\n`;
}

er += '\n';
for (const rel of relations) {
  er += rel + '\n';
}

fs.writeFileSync('er_diagram.mermaid', er);
console.log(er);
