import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="animate-spin" size={40} />
    </div>
  );
};

export default Loading;