const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const crypto = require('node:crypto');
function compile(file, mocks={}) {
  const exports={};
  const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInNewContext(output,{exports,require:name=>Object.hasOwn(mocks,name)?mocks[name]:require(name),Buffer,URL,URLSearchParams,Request,Response,process,console},{filename:file});
  return exports;
}
const core=compile('src/lib/payhere/core.ts');
const merchant='1210000',secret='unit-test-only-secret',id='c5c50b7b-92be-4a34-b00a-18b5ea90b81c';
function notification(status='2',changes={}) {
  const fields=new URLSearchParams({merchant_id:merchant,order_id:id,payment_id:'321000001',payhere_amount:'14000.00',payhere_currency:'LKR',status_code:status,...changes});
  fields.set('md5sig',core.md5(fields.get('merchant_id')+fields.get('order_id')+fields.get('payhere_amount')+fields.get('payhere_currency')+fields.get('status_code')+core.md5(secret)));
  return fields;
}
const order={items:[{id:'simple',order_mode:'cart',price:14000,quantity:1}],subtotal:14000,fees:0,total:14000,total_amount:14000,currency:'LKR',order_type:'package',status:'confirmed'};
test('hash uses the exact official two-decimal contract',()=>{
 const expected=crypto.createHash('md5').update(merchant+id+'14000.00'+'LKR'+crypto.createHash('md5').update(secret).digest('hex').toUpperCase()).digest('hex').toUpperCase();
 assert.equal(core.checkoutHash(merchant,id,'14000','LKR',secret),expected);
 assert.equal(core.amountString('00014.5'),'14.50');
 for(const value of ['1e4','-1','0.001','NaN','1,000.00','Infinity']) assert.throws(()=>core.amountString(value));
});
test('all provider status codes map correctly',()=>{
 for(const [code,status] of [['2','paid'],['0','pending'],['-1','cancelled'],['-2','failed'],['-3','chargeback']]) assert.equal(core.verifyNotification(notification(code),merchant,secret).status,status);
});
test('rejects invalid signature, merchant, currency and malformed callback fields',()=>{
 const bad=notification();bad.set('md5sig','0'.repeat(32));assert.throws(()=>core.verifyNotification(bad,merchant,secret));
 for(const changes of [{merchant_id:'wrong'},{payhere_currency:'USD'},{status_code:'1'},{payhere_amount:'-10'},{order_id:'invalid'},{payment_id:''}]) assert.throws(()=>core.verifyNotification(notification('2',changes),merchant,secret));
 const dup=notification();dup.append('payhere_amount','1.00');assert.throws(()=>core.verifyNotification(dup,merchant,secret));
});
test('snapshot recalculation rejects manipulated totals and custom quotes',()=>{
 assert.equal(core.authoritativeAmount(order),'14000.00');
 for(const change of [{total:1},{subtotal:1},{total_amount:1},{currency:'USD'},{order_type:'custom_package'},{status:'cancelled'},{status:'new'},{payment_status:'paid'},{payment_status:'deposit_paid'},{items:[{price:1,quantity:1,order_mode:'cake'}]},{items:[{price:14000,quantity:0,order_mode:'cart'}]}]) assert.throws(()=>core.authoritativeAmount({...order,...change}));
});
class AccessError extends Error {constructor(status,message){super(message);this.status=status;}}
const NextResponse={json:(value,init)=>Response.json(value,init)};
let calls=[],rpcError=null;
const mocks={ 'next/server':{NextResponse:class extends Response {static json=NextResponse.json;}}, '@/lib/payhere/core':core, '@/lib/admin/server':{AccessError}, '@/lib/payhere/server':{
 payhereConfig:()=>({merchant,secret,mode:'sandbox'}), paymentDatabase:()=>({rpc:async(name,args)=>{calls.push({name,args});return {error:rpcError};}})
}};
const notify=compile('src/app/api/payhere/notify/route.ts',mocks);
test('notify route persists only validated metadata; retries failed DB writes',async()=>{
 calls=[]; rpcError=null;
 const request=(fields,type='application/x-www-form-urlencoded')=>new Request('https://example.test/api/payhere/notify',{method:'POST',headers:{'Content-Type':type},body:fields.toString()});
 assert.equal((await notify.POST(request(notification()))).status,200); assert.equal(calls.length,1);
 assert.equal(calls[0].args.p_amount,'14000.00');assert.equal(calls[0].args.p_status,'paid');
 const bad=notification();bad.set('md5sig','invalid');assert.equal((await notify.POST(request(bad))).status,400);assert.equal(calls.length,1);
 assert.equal((await notify.POST(request(notification(),'application/json'))).status,415);
 rpcError={message:'amount mismatch'};assert.equal((await notify.POST(request(notification('2',{payhere_amount:'1.00'})))).status,503);
});
let initiationArgs,ownershipFilters=[],deniedUser=false;
const ownedOrder={...order,id,order_reference:'SW-TEST'};
const initiationMocks={
 'next/server':{NextResponse}, '@/lib/payhere/core':core, '@/lib/legal':{business:{version:'2026-10-08'}},
 '@/lib/admin/server':{AccessError,sameOrigin:request=>{if(request.headers.get('origin')!=='https://example.test') throw new AccessError(403,'Invalid origin');}},
 '@/lib/payhere/server':{
  uuid:v=>{if(v!==id)throw new AccessError(400,'Invalid order');return v;},
  paymentUser:async()=>{if(deniedUser)throw new AccessError(401,'Sign in');return {id:'owner'};},
  payhereConfig:()=>({merchant,secret,mode:'sandbox',origin:'https://example.test',endpoint:'https://sandbox.payhere.lk/pay/checkout'}),
  paymentDatabase:()=>({from:()=>({select:()=>({eq(key,value){ownershipFilters.push([key,value]);return this;},maybeSingle:async()=>({data:ownedOrder})})}),rpc:async(name,args)=>{initiationArgs=args;return {data:{id}};}})
 }
};
const initiate=compile('src/app/api/payhere/initiate/route.ts',initiationMocks);
const billing={first_name:'QA',last_name:'Customer',email:'qa@example.test',phone:'0771234567',address:'Test address',city:'Test city',country:'Sri Lanka'};
const initiationRequest=(changes={},origin='https://example.test')=>new Request('https://example.test/api/payhere/initiate',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({orderId:id,consent:true,billing,amount:'1.00',...changes})});
test('sandbox initiation ignores browser amount, enforces ownership, sends no secrets',async()=>{
 ownershipFilters=[];const response=await initiate.POST(initiationRequest());assert.equal(response.status,200);
 const data=await response.json();assert.equal(data.fields.amount,'14000.00');assert.equal(data.fields.currency,'LKR');
 assert.equal(data.endpoint,'https://sandbox.payhere.lk/pay/checkout');assert.equal(initiationArgs.p_amount,'14000.00');
 assert.ok(ownershipFilters.some(([k,v])=>k==='user_id'&&v==='owner'));assert.ok(!JSON.stringify(data).includes(secret));
 for(const field of ['merchant_id','return_url','cancel_url','notify_url','first_name','last_name','email','phone','address','city','country','order_id','items','currency','amount','hash']) assert.ok(data.fields[field]);
});
test('initiation rejects absent consent, missing billing, cross-origin and unsigned-in requests',async()=>{
 assert.equal((await initiate.POST(initiationRequest({consent:false}))).status,400);
 assert.equal((await initiate.POST(initiationRequest({billing:{...billing,email:''}}))).status,400);
 assert.equal((await initiate.POST(initiationRequest({},'https://attacker.test'))).status,403);
 deniedUser=true;assert.equal((await initiate.POST(initiationRequest())).status,401);deniedUser=false;
});
// Render the real state component with controlled hook state. No browser URL can
// override the verified_at requirement, even when a stored status says paid.
function renderState(payment,error='',checking=false,cancelled=false) {
 const React=require('react');let index=0;
 const hooks={...React,useState:()=>[[payment,error,checking][index++],()=>{}],useEffect:()=>{}};
 const component=compile('src/components/payhere-state.tsx',{
  react:hooks,'react/jsx-runtime':require('react/jsx-runtime'),'next/link':{__esModule:true,default:({children,...props})=>React.createElement('a',props,children)},'@/lib/legal':{business:{whatsapp:'https://wa.me/94760505866'}}
 });
 return require('react-dom/server').renderToStaticMarkup(React.createElement(component.PayhereState,{attempt:id,cancelled}));
}
const statePayment={order_id:id,order_reference:'SW-TEST',amount:'14000.00',currency:'LKR',package_name:'Test package',surprise_date:'2026-10-20',surprise_time:'18:00',status:'pending',verified_at:null};
test('processing and return UI never claims success before verified callback',()=>{
 assert.ok(renderState(null,'',true).includes('Confirming your payment'));
 assert.ok(!renderState({...statePayment,status:'paid',verified_at:null}).includes('Payment successful'));
 assert.ok(renderState(statePayment).includes('Your payment is being confirmed'));
 assert.ok(!renderState(null,'Unknown record').includes('Payment successful'));
 assert.ok(renderState({...statePayment,status:'paid',verified_at:'2026-10-08T00:00:00Z'}).includes('Payment successful'));
 for(const [status,label] of [['failed','We couldn’t complete'],['cancelled','Payment was cancelled'],['chargeback','Payment disputed'],['refunded','Payment refunded']]) assert.ok(renderState({...statePayment,status,verified_at:'2026-10-08T00:00:00Z'}).includes(label));
});
test('live initiation is blocked until owner policies are approved; callbacks remain available',()=>{
 const exports={};const code=ts.transpileModule(fs.readFileSync('src/lib/payhere/server.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const env={PAYHERE_ENABLED:'true',SURPRISEWALA_CMS_ENABLED:'true',PAYHERE_MODE:'live',PAYHERE_MERCHANT_ID:merchant,PAYHERE_MERCHANT_SECRET:secret,PAYHERE_SITE_URL:'https://example.test'};
 const localMocks={'server-only':{},'@supabase/supabase-js':{},'@/lib/supabase/server':{},'@/lib/supabase/config':{},'@/lib/admin/server':{AccessError},'@/lib/legal':{legalPublicationReady:false}};
 vm.runInNewContext(code,{exports,require:n=>localMocks[n],process:{env},URL});
 assert.throws(()=>exports.payhereConfig());assert.equal(exports.payhereConfig(false).endpoint,'https://www.payhere.lk/pay/checkout');
 env.PAYHERE_MODE='sandbox';assert.equal(exports.payhereConfig().endpoint,'https://sandbox.payhere.lk/pay/checkout');
 env.PAYHERE_ENABLED='false';assert.throws(()=>exports.payhereConfig());assert.equal(exports.payhereConfig(false).mode,'sandbox');
});
