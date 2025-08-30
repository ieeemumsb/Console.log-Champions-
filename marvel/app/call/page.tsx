"use client";

import dynamic from "next/dynamic";

const DynamicVideoUI = dynamic(() => import("@/components/CallView"), {
  ssr: false,
});
// Make sure call view is default export

const CallPage = () => {
  return <DynamicVideoUI />;
};

export default CallPage;
