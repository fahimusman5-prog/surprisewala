import Link from "next/link";
import { CareHeader, CareFooter } from "@/components/legal/layout";
import { PayhereCheckout } from "@/components/payhere-checkout";
import { paymentDatabase, paymentUser, uuid, payhereConfig } from "@/lib/payhere/server";
import { authoritativeAmount } from "@/lib/payhere/core";
export const dynamic="force-dynamic";
export const metadata={title:"Secure Payment",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{order?:string}>}) {
  let orderId="",amount="",reference="",error="";
  try {
    payhereConfig(); const user=await paymentUser(); orderId=uuid((await searchParams).order);
    const result=await paymentDatabase().from("orders").select("*").eq("id",orderId).eq("user_id",user.id).maybeSingle();
    if(result.error||!result.data) throw new Error("Your booking could not be loaded.");
    amount=authoritativeAmount(result.data);reference=result.data.order_reference||result.data.id;
  } catch(e){error=e instanceof Error?e.message:"Payment is unavailable.";}
  return <div className="care-shell"><CareHeader/><main className="pay-card"><p className="care-eyebrow">ONLINE PAYMENT</p><h1>A secure start to your surprise.</h1>{error?<><p role="alert">{error}</p><div className="pay-actions"><Link href="/login">Sign in</Link><Link href="/#packages">Return to booking</Link><Link href="/contact">Contact our team</Link></div></>:<><p>Order {reference}</p><h2>LKR {Number(amount).toLocaleString("en-LK",{minimumFractionDigits:2})}</h2><PayhereCheckout orderId={orderId}/></>}</main><CareFooter/></div>;
}
