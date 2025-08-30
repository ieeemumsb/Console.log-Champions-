import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Link href={"/finance"}>
        <Button>Finance</Button>
      </Link>
      <Link href={"/actions"}>
        <Button>Actions</Button>
      </Link>
      <Link href={"/"}>
        <Button>Study</Button>
      </Link>
    </>
  );
}
