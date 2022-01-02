import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProposalFields {
  title: string;
  who: string;
  what: string;
  timeline: string;
  links: string;
}

export interface EditorSlice {
  proposal: ProposalFields;
}

export const emptyProposal = () => ({
  title: "",
  who: "",
  what: "",
  timeline: "",
  links: "",
});

const initialState: EditorSlice = {
  proposal: emptyProposal(),
};

const proposalSliceFactory =
  (fieldName: "title" | "who" | "what" | "timeline" | "links") =>
  (state: EditorSlice, action: PayloadAction<string>) => {
    state.proposal[fieldName] = action.payload;
  };

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    updateProposal: (state, action: PayloadAction<ProposalFields>) => {
      state.proposal = action.payload;
    },
    patchProposal: (state, action: PayloadAction<Partial<ProposalFields>>) => {
      state.proposal = {
        ...state.proposal,
        ...action.payload,
      };
    },
    updateProposalTitle: proposalSliceFactory("title"),
    updateProposalWho: proposalSliceFactory("who"),
    updateProposalWhat: proposalSliceFactory("what"),
    updateProposalTimeline: proposalSliceFactory("timeline"),
    updateProposalLinks: proposalSliceFactory("links"),
    clearProposal: (state) => {
      state.proposal = emptyProposal();
    }
  },
});

// Action creators are generated for each case reducer function
export const {
  updateProposal,
  patchProposal,
  clearProposal,
  updateProposalLinks,
  updateProposalTimeline,
  updateProposalTitle,
  updateProposalWhat,
  updateProposalWho,
} = editorSlice.actions;

export default editorSlice.reducer;
