const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'../..');
const manifest=require('../../src/data/image-assets.json');

function harness({saveData=false}={}){
  const images=[],timers=new Map(),cache=new Map();let timerId=0;
  class Image {
    constructor(){images.push(this);}
    decode(){return new Promise((resolve,reject)=>{this.finishDecode=resolve;this.failDecode=reject;});}
  }
  const sandbox={window:{Image,devicePixelRatio:2},navigator:{connection:{saveData}},Promise,
    setTimeout(callback){timers.set(++timerId,callback);return timerId;},clearTimeout(id){timers.delete(id);}};
  function load(file){
    if(file==='@/data/image-assets.json')return manifest;
    if(file.startsWith('@/'))file=path.join(root,'src',file.slice(2));
    if(!path.extname(file))file+='.ts';
    if(cache.has(file))return cache.get(file);
    const exports={};cache.set(file,exports);
    const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
    vm.runInNewContext(code,{...sandbox,exports,require(name){return load(name.startsWith('.')?path.resolve(path.dirname(file),name):name);}});
    return exports;
  }
  return {...load(path.join(root,'src/lib/images/preload.ts')),images,timers};
}

test('portrait preparation reuses its request and waits for image decoding',async()=>{
  const h=harness(),src='/img/higher-lower/players/pirlo.png?v=reviewed';
  const ready=h.preloadImage(src,360);let finished=false;ready.then(()=>{finished=true;});
  assert.equal(h.preloadImage(src,360),ready);assert.equal(h.images.length,1);
  assert.match(h.images[0].srcset,/256w/);
  h.images[0].onload();await Promise.resolve();assert.equal(finished,false);
  h.images[0].finishDecode();await ready;assert.equal(finished,true);assert.equal(h.timers.size,0);
});

test('mobile preloads use the exact responsive candidates supplied by the card',async()=>{
  const h=harness();
  const sizes='(max-width:700px) 44vw,360px',srcSet='/small.webp 256w, /large.webp 512w';
  const ready=h.preloadImage('/large.webp',360,{sizes,srcSet,required:true});
  assert.equal(h.images[0].sizes,sizes);assert.equal(h.images[0].srcset,srcSet);
  h.images[0].onload();h.images[0].finishDecode();await ready;
});

test('Higher or Lower prepares versioned portraits through the configured Next image loader',async()=>{
  const calls=[],cache=new Map();
  function load(file){
    if(file==='next/image')return require('next/image');
    if(file==='@/data/image-assets.json')return manifest;
    if(file==='@/lib/images/preload')return {preloadImage(...args){calls.push(args);return Promise.resolve();}};
    if(file.startsWith('@/'))file=path.join(root,'src',file.slice(2));
    if(!path.extname(file))file+='.ts';
    if(cache.has(file))return cache.get(file);
    const exports={};cache.set(file,exports);
    const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
    vm.runInNewContext(code,{exports,require(name){return load(name.startsWith('.')?path.resolve(path.dirname(file),name):name);}});return exports;
  }
  const helper=load(path.join(root,'src/lib/higher-lower/images.ts'));
  await helper.preloadPortrait('/img/higher-lower/players/pirlo.png?v=reviewed');
  assert.equal(calls.length,1);const [src,,options]=calls[0];
  assert(src.startsWith('/img/optimized/'));assert.equal(options.sizes,helper.PORTRAIT_SIZES);
  assert(options.srcSet.includes('256w'));assert(!options.srcSet.includes('/_next/image'));
  assert.equal(options.required,true);
});

test('failed, undecodable and stalled portraits are retryable without freezing the game',async()=>{
  for(const failure of ['network','decode','timeout']){
    const h=harness(),src='/img/higher-lower/players/pirlo.png';
    const ready=h.preloadImage(src,360);
    if(failure==='network')h.images[0].onerror();
    else if(failure==='decode'){h.images[0].onload();h.images[0].failDecode(new Error('bad image'));}
    else [...h.timers.values()][0]();
    await ready;
    const retried=h.preloadImage(src,360);assert.equal(h.images.length,2);
    h.images[1].onerror();await retried;
  }
});

test('reduced-data mode skips speculative images while required portraits still load',async()=>{
  const h=harness({saveData:true});
  await h.preloadImage('/img/higher-lower/players/pirlo.png',360);assert.equal(h.images.length,0);
  const ready=h.preloadImage('/img/higher-lower/players/pirlo.png',360,{required:true});
  assert.equal(h.images.length,1);h.images[0].onerror();await ready;
});
