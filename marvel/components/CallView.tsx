import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

function randomID(len = 5) {
  const chars =
    "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
  return Array.from({ length: len }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

function getUrlParams(url = window.location.href) {
  const urlStr = url.split("?")[1];
  return new URLSearchParams(urlStr);
}

export default function CallPage() {
  const { user } = useUser();
  const roomID = getUrlParams().get("roomID") || randomID(5);
  const containerRef = useRef<HTMLDivElement>(null);
  const addCall = useMutation(api.call.createCall)
  const deleteCall = useMutation(api.call.deleteCall)

  useEffect(() => {
    const initMeeting = async () => {
      try {
        const userId = user?.id || randomID(6);
        const username =
          user?.fullName ||
          user?.emailAddresses[0]?.emailAddress.split("@")[0] ||
          "Guest";

        const res = await fetch(`/api/zegoCloud?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch Zego token");

        const { token, appID } = await res.json();

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          appID,
          token,
          roomID,
          userId,
          username
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);

        zp.joinRoom({
          container: containerRef.current!,
          sharedLinks: [
            {
              name: "Emergency Call",
              url: `${window.location.origin}${window.location.pathname}?roomID=${roomID}`,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall,
          },
          onLeaveRoom() {
              deleteCall({ roomId: roomID });
              zp.destroy();

          },
          
        });

        addCall({ roomId:roomID });

      } catch (err) {
        console.error("Error initializing meeting:", err);
      }
    };

    initMeeting();
  }, [user, roomID]);

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
}
