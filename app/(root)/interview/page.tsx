import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import InterviewPageClient from "@/components/InterviewPageClient";

const Page = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return <InterviewPageClient user={{ name: user.name, id: user.id }} />;
};

export default Page;