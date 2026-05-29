"use client";

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  votes: number;
  createdAt: string;
}

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "1",
    title: "Neon Dragon Deck Design",
    description: "A vibrant neon dragon design with gradient scales and flame accents.",
    proposer: "0x1234...5678",
    votes: 12,
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    title: "Retro Wave Sunset",
    description: "Classic retro wave aesthetic with palm trees and a setting sun.",
    proposer: "0xabcd...efgh",
    votes: 8,
    createdAt: "5 hours ago",
  },
  {
    id: "3",
    title: "Abstract Geometry Pack",
    description: "Clean geometric patterns with bold color blocking.",
    proposer: "0x9abc...def0",
    votes: 5,
    createdAt: "1 day ago",
  },
];

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-black/50">
      <div className="flex-1 min-w-0 mr-4">
        <h3 className="font-medium text-white truncate">{proposal.title}</h3>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{proposal.description}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          <span>by {proposal.proposer}</span>
          <span>{proposal.createdAt}</span>
          <span className="text-purple-400">{proposal.votes} votes</span>
        </div>
      </div>
      <button className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
        Vote
      </button>
    </div>
  );
}

export function ProposalList() {
  return (
    <div className="space-y-3">
      {MOCK_PROPOSALS.map((proposal) => (
        <ProposalCard key={proposal.id} proposal={proposal} />
      ))}
    </div>
  );
}

export const proposals = MOCK_PROPOSALS;
