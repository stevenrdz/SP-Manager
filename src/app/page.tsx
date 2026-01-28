import { Suspense } from "react";
import HomeContent from "./HomeContent";

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Cargando aplicación...</div>}>
      <HomeContent />
    </Suspense>
  );
}
