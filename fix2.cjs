const fs = require('fs');

function replaceInFile(path, replacements) {
  try {
    let content = fs.readFileSync(path, 'utf8');
    for (const [search, replace] of replacements) {
      content = content.replace(search, replace);
    }
    fs.writeFileSync(path, content, 'utf8');
  } catch (e) {
    console.error('Failed to process ' + path + ': ' + e.message);
  }
}

replaceInFile('src/components/layout/AppShell.tsx', [
  [/import React, \{ useState, type ReactNode \} from 'react';/, "import { type ReactNode } from 'react';"]
]);

replaceInFile('src/pages/Journal.tsx', [
  [/import React, \{/g, "import {"]
]);

replaceInFile('src/pages/Nutrition.tsx', [
  [/import React, \{/g, "import {"]
]);

replaceInFile('src/pages/Progress.tsx', [
  [/import React, \{/g, "import {"]
]);

replaceInFile('src/pages/Running.tsx', [
  [/import React, \{/g, "import {"]
]);

replaceInFile('src/pages/Workout.tsx', [
  [/import React, \{/g, "import {"]
]);

