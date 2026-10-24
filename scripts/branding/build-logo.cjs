/** Usage: node scripts/branding/build-logo.cjs <logo-image> <monogram-image> */
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname,'../..'),input=process.argv[2],markInput=process.argv[3];
if(!input||!markInput)throw Error('Provide the logo and monogram image paths.');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
(async()=>{
  const original=await fs.readFile(path.resolve(input));
  const dir=path.join(root,'public/branding');await fs.mkdir(dir,{recursive:true});
  const output=await sharp(original).autoOrient().resize({width:640,withoutEnlargement:true}).webp({quality:92,effort:6}).toBuffer();
  const {width,height}=await sharp(output).metadata();
  await fs.writeFile(path.join(dir,'footygen-logo.webp'),output);
  // Use the supplied FG artwork intact; extracting it from the lockup can clip the design.
  const markOriginal=await fs.readFile(path.resolve(markInput));
  const mark=await sharp(markOriginal).autoOrient().resize({width:256,withoutEnlargement:true}).webp({quality:92,effort:6}).toBuffer();
  const markSize=await sharp(mark).metadata();await fs.writeFile(path.join(dir,'footygen-mark.webp'),mark);
  const manifest={source:`User-supplied ${path.basename(input)}`,sourceSha256:hash(original),url:'/branding/footygen-logo.webp',width,height,bytes:output.length,sha256:hash(output),mark:{source:`User-supplied ${path.basename(markInput)}`,sourceSha256:hash(markOriginal),url:'/branding/footygen-mark.webp',width:markSize.width,height:markSize.height,bytes:mark.length,sha256:hash(mark)}};
  await fs.writeFile(path.join(dir,'logo-assets.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify(manifest));
})().catch(error=>{console.error(error);process.exitCode=1;});
