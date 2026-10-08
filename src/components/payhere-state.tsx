"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { business } from "@/lib/legal";
type Payment = { order_id:string; order_reference:string; amount:string; currency:string; status:string; verified_at:string|null; package_name:string; surprise_date:string; surprise_time:string };
export function PayhereState({ attempt, cancelled = false }: { attempt:string; cancelled?:boolean }) {
  const [payment,setPayment] = useState<Payment|null>(null),[error,setError]=useState(""),[checking,setChecking]=useState(true);
  useEffect(() => {
    let active=true, timer:ReturnType<typeof setTimeout>;
    let count=0;
    async function check() {
      try {
        const result = await fetch(`/api/payhere/status?attempt=${encodeURIComponent(attempt)}`,{cache:"no-store"});
        const data=await result.json(); if(!result.ok) throw new Error(data.error || "Unable to confirm payment.");
        if(!active) return; setPayment(data); setError(""); setChecking(false);
        if (["unpaid","pending"].includes(data.status) && ++count<12) timer=setTimeout(check,5000);
      } catch(e) { if(active){setError(e instanceof Error?e.message:"Unable to confirm payment.");setChecking(false);} }
    }
    void check(); return()=>{active=false;clearTimeout(timer);};
  },[attempt]);
  const status=payment?.status;
  // A return/cancel URL can never manufacture a settled state.
  const paid=status==="paid" && Boolean(payment?.verified_at);
  const title=error?"Payment status unavailable":checking?"Confirming your payment…":paid?"Payment successful 🎉":status==="failed"?"We couldn’t complete your payment.":status==="cancelled"?"Payment was cancelled.":status==="chargeback"?"Payment disputed":status==="refunded"?"Payment refunded":cancelled&&status==="unpaid"?"Checkout was closed":"Your payment is being confirmed.";
  return <><div role="status" aria-live="polite"><p className="care-eyebrow">YOUR BOOKING</p><h1>{title}</h1><p>{paid?"Thank you. Our team will coordinate your surprise and confirm the scheduled arrangement with you.":"This page checks our verified payment record. Contact support before making another payment if confirmation is delayed."}</p></div>{payment&&<dl>{[["Order number",payment.order_reference||payment.order_id],["Amount",`${payment.currency} ${Number(payment.amount).toLocaleString("en-LK",{minimumFractionDigits:2})}`],["Payment status",paid?"Paid — verified":status==="unpaid"?"No verified payment received":status||"Unknown"],["Package",payment.package_name],["Requested surprise",`${payment.surprise_date} ${payment.surprise_time}`]].map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>}<p role="alert" className="pay-error">{error}</p><div className="pay-actions">{payment&&["failed","cancelled"].includes(status||"")&&<Link className="pay-primary" href={`/payment/checkout?order=${payment.order_id}`}>Try Again</Link>}<Link href="/#packages">Return to Checkout</Link><a href={business.whatsapp}>Contact Support</a>{!paid&&<button onClick={()=>location.reload()}>Check status again</button>}</div></>;
}
