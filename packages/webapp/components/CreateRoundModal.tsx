"use client";

import { useState } from "react";

interface CreateRoundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRoundModal({ isOpen, onClose }: CreateRoundModalProps) {
  const [title, setTitle] = useState("");
  const [votingStrategy, setVotingStrategy] = useState("1-per-wallet");
  const [payoutType, setPayoutType] = useState("lump-sum");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Create Round</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Creating round:", { title, votingStrategy, payoutType });
            onClose();
          }}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Round Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="Skateboard Art Contest"
              />
            </div>

            <div>
              <label htmlFor="votingStrategy" className="block text-sm font-medium text-gray-300 mb-1">
                Voting Strategy
              </label>
              <select
                id="votingStrategy"
                value={votingStrategy}
                onChange={(e) => setVotingStrategy(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="1-per-wallet">1 Vote Per Wallet</option>
                <option value="1-per-token">1 Vote Per Token</option>
                <option value="quadratic">Quadratic Voting</option>
              </select>
            </div>

            <div>
              <label htmlFor="payoutType" className="block text-sm font-medium text-gray-300 mb-1">
                Payout Type
              </label>
              <select
                id="payoutType"
                value={payoutType}
                onChange={(e) => setPayoutType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="lump-sum">Lump Sum</option>
                <option value="stream">Superfluid Stream</option>
                <option value="milestone-split">Milestone Split (50/50)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Round
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
