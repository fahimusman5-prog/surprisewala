// Disposable PostgreSQL harness. No production credentials or network access.
// Run: PGLITE_MODULE=/path/to/@electric-sql/pglite/dist/index.js node tests/payhere-database.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
process.on('uncaughtException',e=>{console.error(e.message,e.position||'',e.internalQuery||'');process.exit(1);});
const {PGlite}=await import(pathToFileURL(process.env.PGLITE_MODULE).href);
const db=new PGlite();
await db.exec(`
create role anon; create role authenticated; create role service_role bypassrls;
create schema auth; create schema storage;
create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}'::jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select '{}'::jsonb $$;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security;
grant usage on schema public,auth,storage to anon,authenticated,service_role;
grant execute on function auth.uid(),auth.jwt() to anon,authenticated,service_role;
`);
for(const file of ['20260621000000_membership.sql','20260907000000_booking_order_details.sql','20261004214628_admin_business_cms.sql']) {
 const sql=fs.readFileSync('supabase/migrations/'+file,'utf8').replace('create extension if not exists "pgcrypto";','');
 try{await db.exec(sql);}catch(e){console.error('Baseline schema failure:',file,e.message,'position',e.position,sql.slice(Number(e.position)-90,Number(e.position)+90));throw e;}
}
await db.exec(fs.readFileSync('supabase/migrations/20261008044037_payhere_payments.sql','utf8'));
await db.exec("update public.site_settings set value='true' where key='cms_enabled'");
const user='11111111-1111-4111-8111-111111111111',admin='22222222-2222-4222-8222-222222222222';
await db.query('insert into auth.users(id,email) values($1,$2),($3,$4)',[user,'test@example.test',admin,'admin@example.test']);
await db.query("insert into public.admin_users(id,email,role,active) values($1,$2,'admin',true)",[admin,'admin@example.test']);
let cases=0;
async function makeOrder(){const id=crypto.randomUUID();await db.query(`insert into public.orders(id,user_id,order_type,items,total_amount,status,order_status,currency,subtotal,fees,total,payment_status)
 values($1,$2,'package',$3,14000,'confirmed','confirmed','LKR',14000,0,14000,'unpaid')`,[id,user,JSON.stringify([{id:'test',quantity:1,price:14000,order_mode:'cart'}])]);return id;}
async function service(fn){await db.exec('set role service_role');try{return await fn();}finally{await db.exec('reset role');}}
async function initiate(order,amount=14000,owner=user){return service(async()=> (await db.query('select public.begin_payhere_payment($1,$2,$3,$4,$5) as result',[order,owner,amount,'sandbox','2026-10-08'])).rows[0].result);}
let signature=0;
async function notify(a,status='paid',amount=14000,currency='LKR',paymentId='payment-'+a.id,mode='sandbox',sig){return service(async()=> (await db.query('select public.apply_payhere_notification($1,$2,$3,$4,$5,$6,$7,$8) as result',[a.id,paymentId,amount,currency,status,'VISA',sig||String(++signature).padStart(32,'0'),mode])).rows[0].result);}
const order=await makeOrder(),a=await initiate(order);
assert.equal(a.status,'pending');assert.equal(Number(a.amount),14000);cases++;
await assert.rejects(()=>initiate(order));cases++;
for(const [amount,currency,mode] of [[1,'LKR','sandbox'],[14000,'USD','sandbox'],[14000,'LKR','live']]){await assert.rejects(()=>notify(a,'paid',amount,currency,undefined,mode));cases++;}
const sig='A'.repeat(32);assert.equal(await notify(a,'paid',14000,'LKR',undefined,'sandbox',sig),'applied');cases++;
assert.equal(await notify(a,'paid',14000,'LKR',undefined,'sandbox',sig),'duplicate');cases++;
assert.equal(await notify(a,'pending'),'ignored');cases++;
assert.equal((await db.query('select payment_status,status from orders where id=$1',[order])).rows[0].payment_status,'paid');cases++;
assert.equal((await db.query('select status from orders where id=$1',[order])).rows[0].status,'confirmed');cases++;
await assert.rejects(()=>notify(a,'paid',14000,'LKR','different-payment'));cases++;
assert.equal(await notify(a,'chargeback'),'applied');cases++;
assert.equal(await notify(a,'paid'),'ignored');cases++;
for(const status of ['pending','cancelled','failed']){
 const o=await makeOrder(),attempt=await initiate(o);assert.equal(await notify(attempt,status),'applied');assert.equal((await db.query('select payment_status from orders where id=$1',[o])).rows[0].payment_status,status);cases++;
 if(status!=='pending'){const retry=await initiate(o);assert.notEqual(retry.id,attempt.id);assert.equal(await notify(retry,'paid'),'applied');cases++;}
}
const another=await makeOrder();await assert.rejects(()=>initiate(another,1));await assert.rejects(()=>initiate(another,14000,admin));cases+=2;
await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${admin}',false)`);
await assert.rejects(()=>db.query('select public.begin_payhere_payment($1,$2,14000,\'sandbox\',\'test\')',[another,admin]));cases++;
assert.ok((await db.query('select * from payhere_payments')).rows.length>0);cases++;
await assert.rejects(()=>db.query("update orders set payment_status='paid' where id=$1",[order]));cases++;
await db.query("update orders set admin_notes='Updated by admin',order_status='confirmed' where id=$1",[order]);cases++;
await db.exec('reset role');
await db.exec("set role authenticated; select set_config('request.jwt.claim.sub','"+user+"',false)");
assert.equal((await db.query('select * from payhere_payments')).rows.length,0);cases++;
await db.exec('reset role');
assert.equal((await db.query('select status from orders where id=$1',[order])).rows[0].status,'confirmed');cases++;
await db.exec("select set_config('request.jwt.claim.sub','',false)");
await db.exec("insert into public.collections(id,name,slug) values('33333333-3333-4333-8333-333333333333','Test collection','test-collection'); insert into public.packages(id,slug,name,price,order_mode) values('qa-package','qa-package','QA package',14000,'cart'); insert into public.package_collections(package_id,collection_id) values('qa-package','33333333-3333-4333-8333-333333333333')");
const booking={submission_key:crypto.randomUUID(),customer_name:'QA Customer',customer_phone:'0771234567',surprise_date:'2099-10-20',surprise_location:'Test location',surprise_time:'18:00',surprise_type:'Birthday',recipient_name:'QA Recipient',recipient_relationship:'Friend',items:[{id:'qa-package',quantity:1,price:1}],total:1};
await db.exec('set role anon');
const guest=(await db.query('select public.submit_booking($1) as result',[JSON.stringify(booking)])).rows[0].result;
const duplicateGuest=(await db.query('select public.submit_booking($1) as result',[JSON.stringify(booking)])).rows[0].result;
assert.equal(guest.total,14000);assert.equal(duplicateGuest.id,guest.id);cases+=2;
await db.exec('reset role');await assert.rejects(()=>initiate(guest.id));cases++;
await db.exec("set role authenticated; select set_config('request.jwt.claim.sub','"+user+"',false)");
const member=(await db.query('select public.submit_booking($1) as result',[JSON.stringify({...booking,submission_key:crypto.randomUUID()})])).rows[0].result;
assert.equal(member.total,14000);cases++;
await db.exec('reset role');await assert.rejects(()=>initiate(member.id));cases++;
await db.exec("select set_config('request.jwt.claim.sub','',false)");
console.log(`PostgreSQL payment checks passed (${cases} assertions): actual baseline migrations, atomic updates, signature deduplication, amount/currency/mode/ownership checks, retries, state ordering, RLS/function permissions, preserved admin fulfilment updates.`);
await db.close();
