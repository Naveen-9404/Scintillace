const fs = require('fs');
const path = require('path');

const searchDirs = [
  path.resolve('n:/FestSphere/client/src'),
  path.resolve('n:/FestSphere/backend/src')
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Handle specific multi-line cases first
  content = content.replace(/title:\s*"JNTUA College of Engineering",\s*\n\s*subtitle:\s*"Pulivendula"/g, 'title: "JNTUA College of Engineering Pulivendula (Autonomous)",\n    subtitle: ""');
  
  content = content.replace(/JNTUA College of Engineering,\s*\n\s*Pulivendula/g, "JNTUA College of Engineering Pulivendula (Autonomous)");
  
  content = content.replace(/JNTUA College of Engineering\s*\n\s*\(Autonomous\),\s*Pulivendula/g, "JNTUA College of Engineering Pulivendula (Autonomous)");

  content = content.replace(/JNTUA College of Engineering\s*\n\s*Pulivendula\b(?!\s*\(Autonomous\))/g, "JNTUA College of Engineering Pulivendula (Autonomous)");
  
  content = content.replace(/JNTUACE,\s*Pulivendula/g, "JNTUA College of Engineering Pulivendula (Autonomous)");

  const replacements = [
    { from: /JNTUA College of Engineering,\s*Pulivendula\s*\(Autonomous\)/gi, to: "JNTUA College of Engineering Pulivendula (Autonomous)" },
    { from: /JNTUA College of Engineering\s*\(Autonomous\),\s*Pulivendula/gi, to: "JNTUA College of Engineering Pulivendula (Autonomous)" },
    { from: /JNTUA College of Engineering,\s*Pulivendula/gi, to: "JNTUA College of Engineering Pulivendula (Autonomous)" },
    { from: /JNTUA College of Engineering Pulivendula Autonomous/gi, to: "JNTUA College of Engineering Pulivendula (Autonomous)" },
    { from: /JNTUA College of Engineering Pulivendula\b(?!\s*\(Autonomous\))/gi, to: "JNTUA College of Engineering Pulivendula (Autonomous)" },
  ];

  for (const r of replacements) {
    // Custom check to preserve uppercase cases like JNTUA COLLEGE OF ENGINEERING...
    content = content.replace(r.from, (match) => {
       if (match === match.toUpperCase()) {
          return "JNTUA COLLEGE OF ENGINEERING PULIVENDULA (AUTONOMOUS)";
       }
       return r.to;
    });
  }

  // Ensure double replacements didn't occur (e.g. JNTUA College of Engineering Pulivendula (Autonomous) Pulivendula)
  content = content.replace(/JNTUA College of Engineering Pulivendula \(Autonomous\)\s*\(Autonomous\)/gi, "JNTUA College of Engineering Pulivendula (Autonomous)");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.json')) {
      processFile(fullPath);
    }
  }
}

searchDirs.forEach(d => walk(d));
console.log("Done.");
