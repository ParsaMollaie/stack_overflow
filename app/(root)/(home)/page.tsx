import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="h-screen">
      Home
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
