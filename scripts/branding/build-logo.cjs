/** Usage: node scripts/branding/build-logo.cjs <source-image> */
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname,'../..'),input=process.argv[2];
if(!input)throw Error('Provide the logo image path.');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
(async()=>{
  const original=await fs.readFile(path.resolve(input));
  const dir=path.join(root,'public/branding');await fs.mkdir(dir,{recursive:true});
  const output=await sharp(original).autoOrient().resize({width:640,withoutEnlargement:true}).webp({quality:92,effort:6}).toBuffer();
  const {width,height}=await sharp(output).metadata();
  await fs.writeFile(path.join(dir,'football-genius-logo.webp'),output);
  const sourceSize=await sharp(original).metadata();
  // The supplied lockup places its FG monogram in the first 1.2 image-heights.
  const crop={left:0,top:0,width:Math.min(sourceSize.width,Math.round(sourceSize.height*1.2)),height:sourceSize.height};
  const mark=await sharp(original).extract(crop).resize({width:256,withoutEnlargement:true}).webp({quality:92,effort:6}).toBuffer();
  const markSize=await sharp(mark).metadata();await fs.writeFile(path.join(dir,'football-genius-mark.webp'),mark);
  const manifest={source:`User-supplied ${path.basename(input)}`,sourceSha256:hash(original),url:'/branding/football-genius-logo.webp',width,height,bytes:output.length,sha256:hash(output),mark:{url:'/branding/football-genius-mark.webp',width:markSize.width,height:markSize.height,sourceCrop:crop,bytes:mark.length,sha256:hash(mark)}};
  await fs.writeFile(path.join(dir,'logo-assets.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify(manifest));
})().catch(error=>{console.error(error);process.exitCode=1;});
