/**
 * GET /api/control/style-ids
 * Admin endpoint — returns all NewLeaf payment link style IDs.
 * Requires Clerk auth + admin role.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";

const STYLE_IDS = [
  {
    id: "newleaf-one-time",
    theme: "#000000",
    seller_name: "NewLeaf Financial",
    display_sdk_only: true,
    branding_visibility: false,
    session_expiry: 604800,
    payment_button_text: "Pay Now",
  },
  {
    id: "newleaf-recovery",
    theme: "#D97706",
    seller_name: "NewLeaf Financial",
    sdk_layout: "tabs",
    branding_visibility: false,
    session_expiry: 2592000,
    payment_button_text: "Update Card & Catch Up",
  },
  {
    id: "newleaf-sub-signup",
    theme: "#000000",
    seller_name: "NewLeaf Financial",
    sdk_layout: "tabs",
    branding_visibility: false,
    session_expiry: 2592000,
    payment_button_text: "Authorize Card & Sign Up",
  },
  {
    id: "newleaf-upgrade",
    theme: "#000000",
    seller_name: "NewLeaf Financial",
    sdk_layout: "tabs",
    branding_visibility: false,
    session_expiry: 1209600,
    payment_button_text: "Authorize Plan Change",
  },
  {
    id: "newleaf-resume",
    theme: "#10B981",
    seller_name: "NewLeaf Financial",
    sdk_layout: "tabs",
    branding_visibility: false,
    session_expiry: 1209600,
    payment_button_text: "Resume My Plan",
  },
];

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  return NextResponse.json({ styles: STYLE_IDS });
}
