import { Suspense } from "react";
import ShopClient from "./ShopClient";

function ShopSkeleton() {
  return (
    <main className="min-h-screen bg-[#F2DEC7] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 h-8 w-48 animate-pulse rounded-full bg-[#E1B8A2]/60" />
        <div className="flex gap-8">
          <div className="hidden w-64 shrink-0 lg:block">
            <div className="h-[500px] animate-pulse rounded-3xl bg-white/60" />
          </div>
          <div className="flex-1">
            <div className="mb-6 h-12 animate-pulse rounded-2xl bg-white/60" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-3xl bg-white/60 p-4">
                  <div className="mb-3 h-44 rounded-2xl bg-[#E1B8A2]/40" />
                  <div className="mb-2 h-4 w-3/4 rounded-full bg-[#E1B8A2]/40" />
                  <div className="h-4 w-1/2 rounded-full bg-[#E1B8A2]/40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopClient />
    </Suspense>
  );
}
