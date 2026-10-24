const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const folder=path.join(root,'supabase/migrations');
const files=fs.readdirSync(folder).filter(name=>/^\d+_[a-z0-9_]+\.sql$/.test(name)).sort();
let sql=`-- FootyGen: fresh-project backend setup\n-- Run in the Supabase SQL Editor for project bcghsiwettjrjxgzbtvu.\n-- Includes migration history; safe to rerun the identical setup.\n-- No API keys or passwords are included.\nbegin;\ncreate table if not exists public.football_genius_migrations(name text primary key,sha256 text not null,applied_at timestamptz not null default now());\nalter table public.football_genius_migrations enable row level security;\nrevoke all on public.football_genius_migrations from anon,authenticated;\ngrant all on public.football_genius_migrations to service_role;\n`;
for(const name of files){
  const source=fs.readFileSync(path.join(folder,name),'utf8'),hash=createHash('sha256').update(source).digest('hex');
  const delimiter=`$fg_sql_${hash.slice(0,16)}$`;
  sql+=`\n-- ${name}\ndo $fg_migration$\nbegin\n  if exists(select 1 from public.football_genius_migrations where name='${name}' and sha256<>'${hash}') then raise exception 'Migration changed after application: ${name}'; end if;\n  if not exists(select 1 from public.football_genius_migrations where name='${name}') then\n    execute ${delimiter}\n${source}\n${delimiter};\n    insert into public.football_genius_migrations(name,sha256) values('${name}','${hash}');\n  end if;\nend $fg_migration$;\n`;
}
sql+='\ncommit;\n';
const output=path.join(__dirname,'setup.sql');fs.writeFileSync(output,sql);
console.log(`Built scripts/backend/setup.sql from ${files.length} migrations (${Buffer.byteLength(sql).toLocaleString()} bytes).`);
