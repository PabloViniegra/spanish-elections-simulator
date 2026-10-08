"use client";

import { Analytics } from "@vercel/analytics/next";
import { redactAnalyticsQuery } from "@/lib/analytics";

export function SiteAnalytics() {
  return <Analytics beforeSend={redactAnalyticsQuery} />;
}
