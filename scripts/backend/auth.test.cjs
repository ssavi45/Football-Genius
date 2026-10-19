const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const filename=path.resolve(__dirname,'../../src/lib/supabase/server.ts');
const source=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;

function harness(){
  const url='https://project.supabase.co',calls=[];
  let result={data:{claims:{sub:'account-a',iss:url+'/auth/v1',aud:'authenticated',role:'authenticated'}},error:null};
  const auth={async getClaims(token){calls.push(token||'cookie');return result;},getUser(){throw Error('Unexpected remote user lookup');}};
  const exports={};
  vm.runInNewContext(source,{exports,process,require(name){
    if(name==='server-only')return {};
    if(name==='@supabase/ssr')return {createServerClient:()=>({auth})};
    if(name==='@supabase/supabase-js')return {createClient:()=>({auth})};
    if(name==='next/headers')return {cookies:async()=>({getAll:()=>[],set(){}})};
    if(name==='./config')return {supabaseUrl:url,supabasePublicKey:'test-public-key',supabaseConfigured:true};
    if(name==='@/lib/http/origin')return {};
    throw Error(name);
  }},{filename});
  return {requestUser:exports.requestUser,calls,setResult(value){result=value;},claims:result.data.claims};
}

test('cookie and bearer identities use verified claims without remote user lookups',async()=>{
  const h=harness();assert.equal((await h.requestUser()).id,'account-a');
  assert.equal((await h.requestUser(new Request('https://football.test/api/scoreline',{headers:{Authorization:'Bearer signed-access-token'}}))).id,'account-a');
  assert.deepEqual(h.calls,['cookie','signed-access-token']);
});

test('claims from another project, audience, or role cannot authorize game actions',async()=>{
  for(const patch of [{iss:'https://other.supabase.co/auth/v1'},{aud:'service_role'},{role:'anon'},{sub:''}]){
    const h=harness();h.setResult({data:{claims:{...h.claims,...patch}},error:null});assert.equal(await h.requestUser(),null);
  }
});

test('invalid, expired, and missing sessions cannot authorize game actions',async()=>{
  for(const result of [{data:null,error:Error('Invalid JWT signature')},{data:null,error:Error('JWT expired')},{data:null,error:null}]){
    const h=harness();h.setResult(result);assert.equal(await h.requestUser(),null);
  }
});

test('the installed Auth SDK verifies signatures using cached keys without repeated network calls',async()=>{
  const {createClient}=require(require.resolve('@supabase/supabase-js',{paths:[path.resolve(__dirname,'../..')]}));
  const {generateKeyPairSync,sign,randomUUID}=require('node:crypto');
  const {privateKey,publicKey}=generateKeyPairSync('ec',{namedCurve:'P-256'}),kid=randomUUID();
  const jwk={...publicKey.export({format:'jwk'}),kid,alg:'ES256',use:'sig'};
  let requests=0;
  const client=createClient('https://claims-test.supabase.co','test-key',{
    auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false,storageKey:'claims-test-'+kid},
    global:{fetch:async(url)=>{assert(String(url).endsWith('/.well-known/jwks.json'));requests++;return Response.json({keys:[jwk]});}},
  });
  const jwt=(claims)=>{
    const header=Buffer.from(JSON.stringify({alg:'ES256',typ:'JWT',kid})).toString('base64url');
    const payload=Buffer.from(JSON.stringify(claims)).toString('base64url'),message=header+'.'+payload;
    return message+'.'+sign('sha256',Buffer.from(message),{key:privateKey,dsaEncoding:'ieee-p1363'}).toString('base64url');
  };
  const claims={iss:'https://claims-test.supabase.co/auth/v1',sub:'account-a',role:'authenticated',aud:'authenticated',exp:Math.floor(Date.now()/1000)+600};
  const token=jwt(claims);
  for(let move=0;move<5;move++){const result=await client.auth.getClaims(token);assert.equal(result.error,null);assert.equal(result.data.claims.sub,'account-a');}
  assert.equal(requests,1);
  const parts=token.split('.');parts[1]=Buffer.from(JSON.stringify({...claims,sub:'forged-account'})).toString('base64url');
  assert((await client.auth.getClaims(parts.join('.'))).error);
  assert((await client.auth.getClaims(jwt({...claims,exp:1}))).error);
  assert.equal(requests,1);
});
