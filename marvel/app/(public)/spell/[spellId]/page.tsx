import React from "react";
import { SpellIdView } from "../../_views/SpellIdView";
import { Id } from "@/convex/_generated/dataModel";

const page = async ({ params }: { params: { spellId: Id<"spells"> } }) => {
  const { spellId } = await params;

  return <SpellIdView spellId={spellId} />;
};

export default page;
