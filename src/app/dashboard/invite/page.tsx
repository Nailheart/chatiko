import { Metadata } from "next";
import { InviteFriend } from "@/components/invite-friend/invite-friend";

export const metadata: Metadata = {
  title: "Chatiko | Invite Friend",
};

const Invite = () => {
  return (
    <section className="container py-8">
      <h1 className="my-8 text-5xl font-bold">Invite friend</h1>
      <InviteFriend />
    </section>
  );
};

export default Invite;
