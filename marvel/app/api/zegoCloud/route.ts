import { NextRequest } from "next/server";
import { generateToken04 } from "./zegoServer";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId")!;

  const appID = +process.env.NEXT_PUBLIC_ZEGO_APP_ID!;
  const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!;

  const effectiveTimeInSeconds = 3600;
  const payload = "";

  const token = generateToken04(
    appID,
    userId,
    serverSecret,
    effectiveTimeInSeconds,
    payload
  );

  return Response.json({ token, appID });
}
