import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function OnlineIDE() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-online-ide-dialog", handleOpen);

    return () => {
      window.removeEventListener("open-online-ide-dialog", handleOpen);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl w-full h-[540px] bg-black text-white">
        <DialogHeader>
          <DialogTitle>Code Editor</DialogTitle>
        </DialogHeader>
        <div className="w-full h-[450px]">
          <iframe
            src="https://onecompiler.com/embed/?theme=dark"
            className="w-full h-full border-0 rounded-b-lg"
            allowFullScreen
            title="OneCompiler Embed"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
