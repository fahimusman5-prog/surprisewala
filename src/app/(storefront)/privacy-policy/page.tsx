import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/layout";
import { policies } from "@/lib/policies";
export const metadata: Metadata = { title: "Privacy Policy", description: "How we collect, use and protect your information.", alternates: { canonical: "https://surprisewala.com/privacy-policy" } };
export default function Page() { return <LegalPageLayout policy={policies["privacy-policy"]} />; }
