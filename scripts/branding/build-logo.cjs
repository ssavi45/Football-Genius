/** Preserve the approved artwork and derive the compact FG without redrawing it.
 * Usage: node scripts/branding/build-logo.cjs [higher-resolution-approved-lockup]
 */
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'public/branding');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
(async()=>{
  const file=path.join(dir,'logo-assets.json');
  const previous=JSON.parse(await fs.readFile(file,'utf8'));
  const input=process.argv[2];
  const master=input?await sharp(path.resolve(input)).autoOrient().webp({lossless:true}).toBuffer():await fs.readFile(path.join(dir,'footygen-logo.webp'));
  const dimensions=await sharp(master).metadata();
  const width=dimensions.width,height=dimensions.height;
  const markWidth=Math.round(width*226/640);
  const {data,info}=await sharp(master).extract({left:0,top:0,width:markWidth,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  // The wordmark starts below the upper tip of the FG. Remove only that separate lettering.
  for(let y=0;y<height;y++)for(let x=0;x<markWidth;x++)if(x>=Math.round(width*216/640)&&y>=Math.round(height*36/174)){
    const offset=(y*markWidth+x)*4;data[offset]=255;data[offset+1]=255;data[offset+2]=255;
  }
  // Flood only the connected near-white outside backing. Keep the football's enclosed panels.
  const seen=new Uint8Array(markWidth*height),queue=[];
  const add=(x,y)=>{const i=y*markWidth+x,o=i*4;if(seen[i])return;seen[i]=1;if(Math.min(data[o],data[o+1],data[o+2])>=245&&Math.max(data[o],data[o+1],data[o+2])-Math.min(data[o],data[o+1],data[o+2])<12)queue.push(i);};
  for(let x=0;x<markWidth;x++){add(x,0);add(x,height-1);}for(let y=0;y<height;y++){add(0,y);add(markWidth-1,y);}
  for(let cursor=0;cursor<queue.length;cursor++){const i=queue[cursor],x=i%markWidth,y=Math.floor(i/markWidth);data[i*4+3]=0;if(x>0)add(x-1,y);if(x<markWidth-1)add(x+1,y);if(y>0)add(x,y-1);if(y<height-1)add(x,y+1);}
  const mark=await sharp(data,{raw:info}).png({compressionLevel:9}).toBuffer();
  if(input)await fs.writeFile(path.join(dir,'footygen-logo.webp'),master);
  await fs.writeFile(path.join(dir,'footygen-fg.png'),mark);
  const manifest={...previous,url:'/branding/footygen-logo.webp',width,height,bytes:master.length,sha256:hash(master),mark:{source:'FG pixels extracted losslessly from the approved lockup; outside backing removed',sourceSha256:hash(master),url:'/branding/footygen-fg.png',width:markWidth,height,bytes:mark.length,sha256:hash(mark)}};
  if(input){manifest.source='User-supplied '+path.basename(input);manifest.sourceSha256=hash(await fs.readFile(path.resolve(input)));}
  await fs.writeFile(file,JSON.stringify(manifest,null,2)+'\n');
  console.log('Original lockup preserved; compact FG extracted without tracing or repainting.');
})().catch(error=>{console.error(error);process.exitCode=1;});
