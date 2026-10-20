const {test}=require('node:test');
const assert=require('node:assert/strict');
const load=require('./load-ts.cjs');
const {scoutFeedback:reduce,momentDuration}=load('src/lib/scouts-duel/feedback.ts');
const empty=()=>({match:null,moments:[]});
const view=(fields={})=>({id:'room-a',version:1,status:'waiting',mode:'online',seat:0,logs:[],shot:null,...fields});
const sync=(state,match,silent=false)=>reduce(state,{type:'sync',match,silent});

test('match-found and ready screens appear once across repeated polling snapshots',()=>{
 let state=sync(empty(),view());
 state=sync(state,view({version:2,status:'selecting'}));assert.equal(state.moments.length,1);assert.equal(state.moments[0].kind,'matched');
 state=sync(state,view({version:3,status:'selecting',opponentLocked:true}));assert.equal(state.moments.length,1);
 state=sync(state,view({version:4,status:'active'}));assert.deepEqual(state.moments.map(m=>m.kind),['ready']);
 state=sync(state,view({version:5,status:'active'}));assert.equal(state.moments.length,1);
 assert.equal(sync(empty(),view({status:'selecting',mode:'ai'})).moments.length,0);
});

test('each opponent result follows its pending shot and is not replayed by polling',()=>{
 let state=sync(empty(),view({status:'active',shot:{seat:1,resolveAt:2200}}),true);
 const shot={id:1,seat:1,kind:'shoot',answer:false,text:'Shoot: Rodri',playerId:'rodri',at:2200};
 state=sync(state,view({version:2,status:'active',logs:[shot]}));
 assert.deepEqual(state.moments.map(m=>m.kind),['shot-result']);assert.equal(state.moments[0].log.answer,false);
 state=sync(state,view({version:3,status:'active',logs:[shot]}));assert.equal(state.moments.length,1);
 state=reduce(state,{type:'dismiss',id:state.moments[0].id});
 assert.equal(sync(state,view({version:4,status:'active',logs:[shot]})).moments.length,0);
});

test('slow clients see an incoming shot before the result and victory still retains its reveal',()=>{
 let state=sync(empty(),view({status:'active'}),true);
 state=sync(state,view({version:2,status:'completed',logs:[{id:1,seat:1,kind:'shoot',answer:true,text:'Shoot: Rodri',at:2200}]}));
 assert.deepEqual(state.moments.map(m=>m.kind),['incoming','shot-result']);assert.equal(state.match.status,'completed');
 state=reduce(state,{type:'dismiss',id:state.moments[0].id});assert.equal(state.moments[0].kind,'shot-result');
 assert(state.moments.every(moment=>momentDuration(moment)>0&&momentDuration(moment)<5000));
});

test('restore, stale responses, and leaving the room cannot replay old events',()=>{
 const latest=view({version:10,status:'completed',logs:[{id:1,seat:1,kind:'shoot',answer:true}]});
 let state=sync(empty(),latest,true);assert.equal(state.moments.length,0);
 assert.equal(sync(state,view({version:9,status:'active'})),state);
 state=reduce(state,{type:'clear'});assert.equal(state.match,null);assert.equal(state.moments.length,0);
 state=sync(state,view({id:'room-b',status:'selecting'}));assert.equal(state.moments.length,1);assert(state.moments[0].id.startsWith('room-b'));
});
