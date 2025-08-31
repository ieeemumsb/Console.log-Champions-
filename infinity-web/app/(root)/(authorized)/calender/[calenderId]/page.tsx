import { Id } from "@/convex/_generated/dataModel";
import { CalenderIdView } from "../../_views/CalenderIdView";

const Page = ({ params }: { params: { calenderId: string } }) => {
  const { calenderId } = params;

  return <CalenderIdView calenderId={calenderId as Id<'events'>} />;
};

export default Page;