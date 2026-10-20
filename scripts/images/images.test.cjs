const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const sharp=require('sharp');
const root=path.resolve(__dirname,'../..'),manifest=require('../../src/data/image-assets.json');
function load(file){
  const exports={};
  const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
  vm.runInNewContext(code,{exports,require(name){if(name==='@/data/image-assets.json')return manifest;throw Error(name);}});return exports;
}
const {imageUrl,imageSrcSet}=load('src/lib/images/assets.ts');

test('every responsive URL in the manifest points to a generated static file',()=>{
  assert(Object.keys(manifest).length>2000,'Generate image assets before testing.');
  for(const[src,[id,widths]]of Object.entries(manifest)){
    assert(fs.existsSync(path.join(root,'public',src)));
    assert.match(id,/^[a-f0-9]{20}$/);
    for(const width of widths.length?widths:[null]){
      const output=path.join(root,'public',width?imageUrl(src,width):imageUrl(src,64));
      assert(fs.statSync(output).size>0,output);
    }
  }
});

test('responsive selection caps at source size and leaves external URLs intact',()=>{
  const src='/img/higher-lower/players/pirlo.png';
  assert.equal(imageUrl(src,200),imageUrl(src,256));
  assert.equal(imageUrl(src,9000),imageUrl(src,512));
  assert.match(imageSrcSet(src),/256w/);
  assert.equal(imageSrcSet(`${src}?v=portrait-hash`),imageSrcSet(src));
  for(const external of ['https://lh3.googleusercontent.com/avatar?s=96','data:image/png;base64,abc','/unlisted.svg'])assert.equal(imageUrl(external,128),external);
});

test('generated portraits and title artwork retain aspect ratio and transparency',async()=>{
  for(const[src,width]of [['/img/higher-lower/players/pirlo.png',256],['/img/scoreline/scoreline-hero-logo.png',640],['/img/scouts-duel/title-tactical.webp',640],['/branding/football-genius-logo.webp',320]]){
    const before=await sharp(path.join(root,'public',src)).metadata(),after=await sharp(path.join(root,'public',imageUrl(src,width))).metadata();
    assert.equal(after.format,'webp');assert(after.width<=before.width);
    assert(Math.abs(after.height-Math.round(before.height*after.width/before.width))<=1);
    if(before.hasAlpha)assert.equal(after.hasAlpha,true,src);
  }
});

test('frequently displayed assets meet transfer budgets',()=>{
  const size=src=>fs.statSync(path.join(root,'public',src)).size;
  for(const[src,width,budget]of [['/img/higher-lower/players/pirlo.png',256,35000],['/img/hero/football_trio_hero.jpg',960,160000],['/img/matrix/football-matrix-logo.webp',640,60000],['/img/higher-lower/player-burst.png',1280,220000]]){
    const actual=size(imageUrl(src,width));assert(actual<budget,`${src}: ${actual} bytes`);assert(actual<size(src)/4,src);
  }
});

test('Next uses prebuilt responsive images and gives hashed URLs immutable caching',async()=>{
  const config=load('next.config.ts').default;
  assert.notEqual(config.images.unoptimized,true);assert.equal(config.images.loader,'custom');
  const headers=await config.headers();
  const rule=headers.find(row=>row.source==='/img/optimized/:path*');
  assert.match(rule.headers.find(row=>row.key==='Cache-Control').value,/max-age=31536000, immutable/);
  const css=fs.readFileSync(path.join(root,'src/app/image-assets.css'),'utf8');
  assert(!css.includes('player-burst.png'));
  for(const match of css.matchAll(/url\("([^"]+)"\)/g))assert(fs.existsSync(path.join(root,'public',match[1])));
});
