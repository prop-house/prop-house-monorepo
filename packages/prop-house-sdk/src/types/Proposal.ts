import { ProposalType } from "@snapshot-labs/snapshot.js/dist/sign/types";

export interface ProposalUserInput {
    space: string,
    title: string,
    body: string
}

export interface ProposalSpaceInput {
    type: ProposalType,    
    discussion: string,
    choices: string[],
    start: number, 
    end: number, 
    snapshot: number,
    plugins: string,
}