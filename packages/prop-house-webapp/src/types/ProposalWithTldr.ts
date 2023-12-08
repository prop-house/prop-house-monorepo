import { Proposal } from '@prophouse/sdk-react';

export type ProposalWithTldr = Proposal & { tldr: string };
