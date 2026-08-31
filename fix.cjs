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

replaceInFile('src/App.tsx', [[/import React from 'react';?\n/, '']]);
replaceInFile('src/components/dashboard/DashboardHero.tsx', [[/import \{ cn \} from '\.\.\/\.\.\/lib\/utils';?\n/, '']]);
replaceInFile('src/components/layout/AppShell.tsx', [
  [/import React, \{ useState \} from 'react';/, "import { useState } from 'react';"], 
  [/Trophy, /g, '']
]);
replaceInFile('src/data/store.ts', [
  [/import type \{ AppState, Task, TaskCompletion, Workout, Run, Nutrition, BodyMeasurement, SleepEntry, JournalEntry, ChallengeSettings \} from '\.\/types';/, "import type { AppState } from './types';"], 
  [/import \{ format \} from 'date-fns';?\n/, '']
]);
replaceInFile('src/pages/CalendarView.tsx', [[/import React from 'react';?\n/, '']]);
replaceInFile('src/pages/Journal.tsx', [
  [/import React, \{ useState \} from 'react';/, "import { useState } from 'react';"], 
  [/import React from 'react';?\n/, '']
]);
replaceInFile('src/pages/Nutrition.tsx', [
  [/import React, \{ useState \} from 'react';/, "import { useState } from 'react';"], 
  [/import React from 'react';?\n/, '']
]);
replaceInFile('src/pages/Progress.tsx', [
  [/import React from 'react';?\n/, ''], 
  [/const \{ tasks, taskCompletions \} = useAppStore\(\);/, 'const { tasks } = useAppStore();']
]);
replaceInFile('src/pages/Running.tsx', [
  [/import React, \{ useState \} from 'react';/, "import { useState } from 'react';"], 
  [/import React from 'react';?\n/, ''], 
  [/import \{ cn \} from '\.\.\/lib\/utils';?\n/, '']
]);
replaceInFile('src/pages/Settings.tsx', [
  [/import React, \{ useState \} from 'react';/, "import { useState } from 'react';"], 
  [/import React from 'react';?\n/, ''], 
  [/Save, /g, '']
]);
replaceInFile('src/pages/Today.tsx', [
  [/import \{ DashboardHero \} from '\.\.\/components\/dashboard\/DashboardHero';?\n/, ''], 
  [/import \{ cn \} from '\.\.\/lib\/utils';?\n/, '']
]);
replaceInFile('src/pages/Workout.tsx', [
  [/import React, \{ useState \} from 'react';/, "import { useState } from 'react';"], 
  [/import React from 'react';?\n/, ''], 
  [/, WorkoutSet/g, ''], 
  [/\(_, eIdx\)/g, '(_, _eIdx)']
]);
