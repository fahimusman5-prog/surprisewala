export const business = {
  brand: "Surprisewala",
  policiesApproved: false,
  legalName: "[BUSINESS LEGAL NAME]",
  address: "[BUSINESS ADDRESS]",
  email: "[SUPPORT EMAIL]",
  phone: "+94 76 050 5866",
  whatsapp: "https://wa.me/94760505866",
  refundPeriod: "[REFUND REQUEST PERIOD]",
  cancellationPeriod: "[CANCELLATION NOTICE PERIOD]",
  retentionPeriod: "[DATA RETENTION PERIOD]",
  updated: "8 October 2026",
  version: "2026-10-08",
};
export const legalLinks = [
  ["/privacy-policy", "Privacy Policy"],
  ["/terms-and-conditions", "Terms & Conditions"],
  ["/refund-policy", "Refund & Cancellation"],
  ["/delivery-policy", "Delivery & Fulfilment"],
] as const;

export const legalPublicationReady = business.policiesApproved && [business.legalName,business.address,business.email,business.refundPeriod,business.cancellationPeriod,business.retentionPeriod].every(value => !value.includes("["));
