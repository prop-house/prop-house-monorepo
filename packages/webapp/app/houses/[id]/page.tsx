"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { RoundGrid } from "@/components/RoundCard";
import { CreateRoundModal } from "@/components/CreateRoundModal";

interface HouseParams {
  params: Promise<{ id: string }>;
}

export default function HouseDetailPage({ params }: HouseParams) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Back to Houses
            </Link>
            <h1 className="text-3xl font-bold mt-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lil Nouns Official
            </h1>
            <p className="mt-2 text-gray-400">
              The official Lil Nouns community house for rounds and grants.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            + Create Round
          </button>
        </div>

        <RoundGrid />
      </main>

      <CreateRoundModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
