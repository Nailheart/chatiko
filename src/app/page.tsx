import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "./api/auth/[...nextauth]/route";
import { SignIn } from "@/components/sign-in/sign-in";

const Home = async () => {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <section>
      <SignIn />
    </section>
  );
};

export default Home;
