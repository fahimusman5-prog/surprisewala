import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/layout";
import { policies } from "@/lib/policies";
export const metadata: Metadata = { title: "Refund & Cancellation Policy", description: "Thoughtful support when plans need to change.", alternates: { canonical: "https://surprisewala.com/refund-policy" } };
export default function Page() { return <LegalPageLayout policy={policies["refund-policy"]} />; }
