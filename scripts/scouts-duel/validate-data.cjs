const fs=require('node:fs'),path=require('node:path');
const load=require('./load-ts.cjs');
const {scoutPlayers:players,SCOUT_AS_OF,SCOUT_DATASET_VERSION}=load('src/lib/scouts-duel/data.ts');
const {generateScoutBoard}=load('src/lib/scouts-duel/board.ts');
const root=path.resolve(__dirname,'../..');
const problems=[];
for(const p of players){
  for(const field of ['id','name','nationality','continent','position','footedness'])if(!p[field])problems.push(`${p.id}: missing ${field}`);
  for(const field of ['image','nationalityFlag'])if(!fs.existsSync(path.join(root,'public',p[field])))problems.push(`${p.id}: missing ${field} asset`);
}
let solved=0;for(let seed=1;seed<=1000;seed++){try{generateScoutBoard(players,seed.toString(16).padStart(16,'0'));solved++;}catch(e){problems.push(`seed ${seed}: ${e.message}`);}}
const counts=field=>Object.fromEntries(Object.entries(Object.groupBy(players,p=>String(p[field]))).map(([key,value])=>[key,value.length]));
const report={datasetVersion:SCOUT_DATASET_VERSION,asOf:SCOUT_AS_OF,players:players.length,positions:counts('position'),continents:counts('continent'),unknownAge:players.filter(p=>p.age===null).map(p=>p.id),unknownHistory:players.filter(p=>p.pastClubs===null).map(p=>p.id),activeWithoutLeague:players.filter(p=>!p.isRetired&&!p.league).map(p=>p.id),testedBoards:1000,balancedBoards:solved,problems,factualAudit:'PARTIAL: legacy football attributes have not all been independently sourced. See corrections and README. Unknown facts are never answered as false.'};
fs.mkdirSync(path.join(root,'tmp/scouts-duel'),{recursive:true});fs.writeFileSync(path.join(root,'tmp/scouts-duel/validation-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(problems.length)process.exitCode=1;
