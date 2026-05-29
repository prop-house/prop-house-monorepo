"use client";

import Link from "next/link";

interface Round {
  id: string;
  title: string;
  status: "active" | "finalized" | "cancelled";
  deposited: string;
  manager: string;
}

const MOCK_ROUNDS: Round[] = [
  {
    id: "1",
    title: "Skateboard Deck Design Contest",
    status: "active",
    deposited: "2.5 ETH",
    manager: "0x1234...5678",
  },
  {
    id: "2",
    title: "Lil Nouns Art Challenge",
    status: "finalized",
    deposited: "5 ETH",
    manager: "0xabcd...efgh",
  },
];

const STATUS_COLORS = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  finalized: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function RoundCard({ round }: { round: Round }) {
  return (
    <Link href={`/rounds/${round.id}`}>
      <div className="group border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all bg-gray-900/50 hover:bg-gray-900">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
            {round.title}
          </h3>
          <span
            className={`px-2 py-1 rounded-full text-xs border ${STATUS_COLORS[round.status]}`}
          >
            {round.status}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
          <span>{round.deposited} deposited</span>
          <span>Manager: {round.manager}</span>
        </div>
      </div>
    </Link>
  );
}

export function RoundGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MOCK_ROUNDS.map((round) => (
        <RoundCard key={round.id} round={round} />
      ))}
    </div>
  );
}

export const rounds = MOCK_ROUNDS;
