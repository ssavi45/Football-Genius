const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
function loadEnv(){
  const env={...process.env};
  for(const filename of ['.env','.env.local']){
    const file=path.join(root,filename);if(!fs.existsSync(file))continue;
    for(const line of fs.readFileSync(file,'utf8').split(/\r?\n/)){
      const match=line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);if(!match)continue;
      let value=match[2];if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);
      env[match[1]]=value;
    }
  }
  return env;
}
module.exports={loadEnv,root};
