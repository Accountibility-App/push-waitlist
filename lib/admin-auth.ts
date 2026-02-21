import { headers } from "next/headers";

const ADMIN_USER = process.env.ADMIN_USER ?? "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD ?? "changeme";

export async function isAdminRequest(): Promise<boolean> {
  const headersList = await headers();
  const auth = headersList.get("authorization");
  if (!auth?.startsWith("Basic ")) return false;
  const base64 = auth.slice(6);
  try {
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    const [user, pass] = decoded.split(":");
    return user === ADMIN_USER && pass === ADMIN_PASS;
  } catch {
    return false;
  }
}

export function requireAdminAuthResponse() {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin"',
    },
  });
}
