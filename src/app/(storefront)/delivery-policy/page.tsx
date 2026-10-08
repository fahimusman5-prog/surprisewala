import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/layout";
import { policies } from "@/lib/policies";
export const metadata: Metadata = { title: "Delivery & Fulfilment Policy", description: "The details that help your surprise arrive beautifully.", alternates: { canonical: "https://surprisewala.com/delivery-policy" } };
export default function Page() { return <LegalPageLayout policy={policies["delivery-policy"]} />; }
