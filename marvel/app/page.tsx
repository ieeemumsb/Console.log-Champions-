import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Link href={"/finance"}>
        <Button>Finance</Button>
      </Link>
      <Link href={"/calender"}>
        <Button>Calendar</Button>
      </Link>
      <Link href={"/"}>
        <Button>Study</Button>
      </Link>
    </>
  );
}
