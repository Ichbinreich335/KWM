import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const ZIEL = "/uebersicht";

export default function Block() {
  useEffect(() => {
    window.location.replace(ZIEL + window.location.search);
  }, []);

  return (
    <div className="container py-10">
      <div className="content flex items-center justify-center gap-2 text-base text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> Übersicht wird geöffnet …
      </div>
    </div>
  );
}
