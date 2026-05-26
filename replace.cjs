const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') filelist.push(dirFile);
    }
  });
  return filelist;
};

const extensions = ['.ts', '.tsx', '.js', '.jsx', '.html', '.md', '.json'];
const excludeDirs = ['node_modules', '.git', 'dist', '.vercel'];

const files = walkSync('.').filter(f => {
  const ext = path.extname(f);
  const isExcluded = excludeDirs.some(d => f.includes(`/${d}/`) || f.startsWith(`${d}/`));
  return extensions.includes(ext) && !isExcluded;
});

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Protect the API url
  content = content.replace(/caztiq-api-production\.up\.railway\.app/g, '___API_URL___');
  
  // Protect the directory name if it's used in paths (like caztiq-api)
  content = content.replace(/caztiq-api/g, '___API_DIR___');

  content = content.replace(/Gcaztiq/g, 'Rollio');
  content = content.replace(/gcaztiq/g, 'rollio');
  content = content.replace(/Caztiq/g, 'Rollio');
  content = content.replace(/caztiq/g, 'rollio');

  // Restore
  content = content.replace(/___API_URL___/g, 'caztiq-api-production.up.railway.app');
  content = content.replace(/___API_DIR___/g, 'caztiq-api');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
