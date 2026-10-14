const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app', 'api', '[[...route]]');
const files = fs.readdirSync(dir);

const replaceStr = "clerkMiddleware({ publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, secretKey: process.env.CLERK_SECRET_KEY, })";

files.forEach(file => {
  if (file.endsWith('.ts')) {
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');
    if (content.includes('clerkMiddleware()')) {
      content = content.replace(/clerkMiddleware\(\)/g, replaceStr);
      fs.writeFileSync(p, content);
      console.log(`Updated ${file}`);
    }
  }
});
