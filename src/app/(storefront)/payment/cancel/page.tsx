import { CareHeader, CareFooter } from "@/components/legal/layout";
import { PayhereState } from "@/components/payhere-state";
export const dynamic="force-dynamic";
export const metadata={title:"Payment Status",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{attempt?:string}>}) {
  const {attempt}=await searchParams;
  return <div className="care-shell"><CareHeader/><main className="pay-card"><PayhereState attempt={attempt||""} cancelled={true}/></main><CareFooter/></div>;
}
