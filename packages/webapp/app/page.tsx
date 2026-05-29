"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { HouseGrid } from "@/components/HouseCard";
import { CreateHouseModal } from "@/components/CreateHouseModal";

export default function HomePage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Houses
            </h1>
            <p className="mt-2 text-gray-400">
              Community-powered rounds on Base. Submit, vote, win.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            + Create House
          </button>
        </div>

        <HouseGrid />
      </main>

      <CreateHouseModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
