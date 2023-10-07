import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin" size={40} />
    </div>
  );
};

export default Loading;
