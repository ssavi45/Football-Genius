const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const cache = new Map();
function load(file) {
  if (file.startsWith('@/')) file = path.join(root, 'src', file.slice(2));
  if (!path.extname(file)) file += '.ts';
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const exports = {}; cache.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  }}).outputText;
  vm.runInNewContext(code, { exports, Intl, Date, require(name) {
    if (name.startsWith('node:')) return require(name);
    return load(name.startsWith('@/') ? name : path.resolve(path.dirname(file), name));
  }}, { filename: file });
  return exports;
}
module.exports = { load, root };
