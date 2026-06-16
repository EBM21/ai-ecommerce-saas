import fs from 'fs';

const filePath = 'src/app/dashboard/customizer/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The regex might have left a trailing brace or something.
// Let's re-read the file to see what happened.

fs.writeFileSync(filePath, content, 'utf8');
