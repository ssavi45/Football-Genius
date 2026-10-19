// Cache real player cutouts and give every Scout's Duel portrait the same frame.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname,'../..');
const {scoutPlayers}=require('./load-ts.cjs')('src/lib/scouts-duel/data.ts');
const replacements={
  ramos:[155862,'Sergio Ramos'],cruyff:[190045,'Johan Cruyff'],schmeichel:[238428,'Peter Schmeichel'],
  navas:[193041,'Keylor Navas'],lloris:[167948,'Hugo Lloris'],thiago_silva:[164240,'Thiago Silva'],
  walker:[188377,'Kyle Walker'],busquets:[189511,'Sergio Busquets'],pogba:[195864,'Paul Pogba'],
  garnacho:[268438,'Alejandro Garnacho'],firmino:[201942,'Roberto Firmino'],jota:[224458,'Diogo Jota'],
  nunez:[253072,'Darwin Nunez'],felix:[242444,'Joao Felix'],wilson:[196978,'Callum Wilson'],
  mitrovic:[215716,'Aleksandar Mitrovic'],fenomeno:[37576,'Ronaldo'],pele:[237067,'Pele'],
  maradona:[190042,'Diego Armando Maradona'],cavani:[179813,'Edinson Cavani'],robben:[9014,'Arjen Robben'],
  reus:[188350,'Marco Reus'],muller:[189596,'Thomas Muller'],
};
const normalize=s=>s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const out=path.join(root,'public/img/scouts-duel/players'),cache=path.join(root,'tmp/scouts-duel/portrait-sources');
const manifestPath=path.join(root,'public/img/scouts-duel/portrait-sources.json');
async function readJson(file){try{return JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}}
async function download(url){
  for(let attempt=0;attempt<3;attempt++){
    const response=await fetch(url,{signal:AbortSignal.timeout(15000)});
    if(response.ok)return response;
    if((response.status>=500||response.status===429)&&attempt<2){await new Promise(r=>setTimeout(r,500*(attempt+1)));continue;}
    throw Error(`HTTP ${response.status}: ${url}`);
  }
}
async function main(){
  await fs.mkdir(out,{recursive:true});await fs.mkdir(cache,{recursive:true});
  const previous=await readJson(manifestPath),entries={};let index=0;
  async function build(player){
    let source=previous?.players[player.id]?.source,bytes;
    if(replacements[player.id]){
      source=source||await readJson(path.join(cache,`${player.id}.json`));
      const [id,name]=replacements[player.id];
      const cached=path.join(cache,`${player.id}.png`);
      if(source?.cache){try{bytes=await fs.readFile(cached);if(digest(bytes)!==source.sha256)throw Error(`${player.id}: source cache changed`);}catch(e){if(e.code!=='ENOENT')throw e;}}
      if(!bytes){
        const page=`https://www.fut.gg/players/${id}-${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}/`;
        const html=await(await download(page)).text(),title=html.match(/<title>(.*?)<\/title>/)?.[1]||'';
        if(!normalize(title).includes(normalize(name)))throw Error(`${player.id}: portrait identity mismatch: ${title}`);
        let url;
        for(const candidate of [`https://cdn.futbin.com/content/fifa25/img/players/${id}.png`,`https://game-assets.fut.gg/2022/players/${id}.png`,`https://cdn.futbin.com/content/fifa21/img/players/${id}.png`]){
          try{const b=Buffer.from(await(await download(candidate)).arrayBuffer());const meta=await sharp(b).metadata();if(!meta.hasAlpha||meta.width<120||meta.height<120)throw Error('Not a transparent portrait');bytes=b;url=candidate;break;}catch{/* Try the older real cutout for historical players. */}
        }
        if(!bytes)throw Error(`${player.id}: no verified cutout found`);
        await fs.writeFile(cached,bytes);
        source={url,page,identityTitle:title,eaPlayerId:id,cache:`tmp/scouts-duel/portrait-sources/${player.id}.png`,sha256:digest(bytes)};
        await fs.writeFile(path.join(cache,`${player.id}.json`),JSON.stringify(source));
      }
    }else{
      const local=source?.local||player.image;
      bytes=await fs.readFile(path.join(root,'public',local));
      source={local,sha256:digest(bytes),provenance:'/img/higher-lower/asset-sources.json'};
    }
    const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let left=info.width,top=info.height,right=-1,bottom=-1,transparent=0;
    for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
      if(data[(y*info.width+x)*4+3]<=8){transparent++;continue;}
      left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    }
    if(right<left||transparent/(info.width*info.height)<.12)throw Error(`${player.id}: not a cutout`);
    const fitted=await sharp(bytes).extract({left,top,width:right-left+1,height:bottom-top+1}).resize(240,248,{fit:'inside'}).png().toBuffer();
    const size=await sharp(fitted).metadata();
    const output=await sharp({create:{width:256,height:256,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:fitted,left:Math.floor((256-size.width)/2),top:252-size.height}]).webp({quality:90,alphaQuality:100,effort:4}).toBuffer();
    await fs.writeFile(path.join(out,`${player.id}.webp`),output);
    entries[player.id]={name:player.name,path:`/img/scouts-duel/players/${player.id}.webp`,width:256,height:256,bytes:output.length,sha256:digest(output),source};
    console.log(`${player.id}: ${output.length} bytes`);
  }
  await Promise.all(Array.from({length:4},async()=>{while(index<scoutPlayers.length)await build(scoutPlayers[index++]);}));
  const players=Object.fromEntries(Object.entries(entries).sort(([a],[b])=>a.localeCompare(b)));
  await fs.writeFile(manifestPath,JSON.stringify({method:'Real sourced transparent portraits; alpha bounds trimmed, resized proportionally and centered on a 256x256 transparent canvas. No generated faces.',players},null,2)+'\n');
  await fs.writeFile(path.join(root,'src/data/scouts-duel-portraits.json'),JSON.stringify(Object.fromEntries(Object.entries(players).map(([id,p])=>[id,p.path])),null,2)+'\n');
  console.log(`Built ${Object.keys(players).length} normalized portraits; replaced ${Object.keys(replacements).length} full-photo fallbacks.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
