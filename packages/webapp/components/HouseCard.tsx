"use client";

import Link from "next/link";

interface House {
  id: string;
  name: string;
  description: string;
  roundCount: number;
}

const MOCK_HOUSES: House[] = [
  {
    id: "1",
    name: "Lil Nouns Official",
    description: "The official Lil Nounds community house for rounds and grants.",
    roundCount: 3,
  },
  {
    id: "2",
    name: "Skateboard Art House",
    description: "Showcase your skateboard deck designs and compete in art rounds.",
    roundCount: 1,
  },
];

export function HouseCard({ house }: { house: House }) {
  return (
    <Link href={`/houses/${house.id}`}>
      <div className="group border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all bg-gray-900/50 hover:bg-gray-900">
        <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
          {house.name}
        </h3>
        <p className="mt-2 text-sm text-gray-400 line-clamp-2">{house.description}</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <span>{house.roundCount} round{house.roundCount !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </Link>
  );
}

export function HouseGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {MOCK_HOUSES.map((house) => (
        <HouseCard key={house.id} house={house} />
      ))}
    </div>
  );
}

export const houses = MOCK_HOUSES;
