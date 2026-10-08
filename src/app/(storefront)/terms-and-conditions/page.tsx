import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/layout";
import { policies } from "@/lib/policies";
export const metadata: Metadata = { title: "Terms & Conditions", description: "Clear expectations for every carefully planned surprise.", alternates: { canonical: "https://surprisewala.com/terms-and-conditions" } };
export default function Page() { return <LegalPageLayout policy={policies["terms-and-conditions"]} />; }
