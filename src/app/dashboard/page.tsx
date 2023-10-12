import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Image from "next/image";

const Dashboard = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  return (
    <section className="container h-full py-8">
      <Image
        className="mx-auto mt-10"
        src="/img/chatiko.webp"
        width={150}
        height={150}
        alt="Face of the dog Chatiko"
      />

      <h1 className="mb-4 text-center text-5xl font-bold">
        Welcome to <span className="text-[--orange]">Chatiko</span>
      </h1>

      <div className="grid justify-center">
        <p className="text-xl font-semibold">You can:</p>
        <ul>
          <li>
            - add registered users to friend list on{" "}
            <span className="text-destructive">Invite Friend</span> page
          </li>
          <li>
            - accept or reject incoming friend request on{" "}
            <span className="text-destructive">Friend Request</span> page
          </li>
          <li>
            - create new chat for you and your friends with{" "}
            <span className="text-destructive">New Chat</span> popup
          </li>
          <li>
            - or don&apos;t make Chatiko wait and start writing messages on{" "}
            <span className="text-destructive">Global Chat</span> page
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Dashboard;
