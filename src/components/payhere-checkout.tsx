"use client";
import { useState } from "react";
import { legalLinks } from "@/lib/legal";
export function PayhereCheckout({ orderId }: { orderId:string }) {
  const [busy,setBusy] = useState(false), [error,setError] = useState("");
  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const billing = Object.fromEntries(["first_name","last_name","email","phone","address","city","country"].map(key => [key,form.get(key)]));
    try {
      const response = await fetch("/api/payhere/initiate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId,billing,consent:form.get("consent")==="on"})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Payment could not be prepared.");
      if (!["https://sandbox.payhere.lk/pay/checkout","https://www.payhere.lk/pay/checkout"].includes(result.endpoint)) throw new Error("Invalid checkout endpoint.");
      const post = document.createElement("form"); post.method="POST"; post.action=result.endpoint;
      for (const [name,value] of Object.entries(result.fields)) { const input=document.createElement("input"); input.type="hidden"; input.name=name; input.value=String(value); post.appendChild(input); }
      document.body.appendChild(post); post.submit();
    } catch(e) { setError(e instanceof Error ? e.message : "Unable to start payment."); setBusy(false); }
  }
  return <form onSubmit={submit}><h2>Billing details</h2><p>Enter the payer’s billing information. Your surprise location stays as entered in your booking.</p>{[["first_name","First name","text"],["last_name","Last name","text"],["email","Email address","email"],["phone","Phone number","tel"],["address","Billing address","text"],["city","City","text"],["country","Country","text"]].map(([name,label,type]) => <label key={name}>{label}<input name={name} type={type} required maxLength={240} autoComplete={{first_name:"given-name",last_name:"family-name",email:"email",phone:"tel",address:"street-address",city:"address-level2",country:"country-name"}[name]} /></label>)}<label className="pay-consent"><input type="checkbox" name="consent" required/><span>I agree to the <a href={legalLinks[1][0]} target="_blank" rel="noopener noreferrer">Terms & Conditions</a> and acknowledge the <a href={legalLinks[0][0]} target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href={legalLinks[2][0]} target="_blank" rel="noopener noreferrer">Refund & Cancellation Policy</a>.</span></label><p role="alert" className="pay-error">{error}</p><button type="submit" disabled={busy}>{busy ? "Preparing secure checkout…" : "Pay Securely"}</button><p>Payments are securely processed by PayHere when online payment is enabled. Availability and any additional location charges must be confirmed with our team before payment.</p></form>;
}
