const {DecoySimulation} = require('./load.cjs')('./src/lib/decoy/simulation.ts');
function run(level, seed, route, feint = true) {
  const s = new DecoySimulation(level, seed); s.start();
  for (let i=0;i<2800;i++) {
    const t=s.elapsed;
    const target=t < route[0] ? {x:700,y:300} : {x:route[1],y:route[2]};
    s.step({x:target.x-s.player.x,y:target.y-s.player.y,sprint:true,feint:feint && t>route[3] && t<route[3]+.017});
    if(s.phase==='goal'||s.phase==='failure') break;
  }
  return s;
}
if(require.main===module) for(let l=0;l<3;l++) {
  let wins=0;const examples=[];
  for(let s=1;s<=30;s++) for(const route of [[.9,790,500,1.2],[1.2,790,110,1.4],[.6,830,480,1],[1.5,760,100,1.7]]) {
    const g=run(l,s,route);if(g.phase==='goal'){wins++;if(examples.length<3)examples.push({seed:s,route,score:g.score,time:g.elapsed.toFixed(1)});}
  }
  const idle=new DecoySimulation(l,42);idle.start();for(let i=0;i<2800;i++)idle.step({x:0,y:0,sprint:false,feint:false});
  console.log({level:l,wins,outOf:120,examples,idle:idle.phase,reason:idle.reason});
}
module.exports={run};
