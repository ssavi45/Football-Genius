const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'../..'),cache=new Map();
module.exports=function load(file){
  const absolute=path.resolve(root,file);
  if(cache.has(absolute))return cache.get(absolute).exports;
  const module={exports:{}};cache.set(absolute,module);
  const requireLocal=id=>{
    if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
    let resolved=id.startsWith('@/')?path.join(root,'src',id.slice(2)):path.resolve(path.dirname(absolute),id);
    if(resolved.endsWith('.json'))return JSON.parse(fs.readFileSync(resolved,'utf8'));
    if(!path.extname(resolved))resolved+='.ts';
    return load(resolved);
  };
  const js=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  vm.runInThisContext(`(function(require,module,exports){${js}\n})`,{filename:absolute})(requireLocal,module,module.exports);
  return module.exports;
};
