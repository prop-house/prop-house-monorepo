import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProposalFields } from '../../utils/proposalFields';

export interface EditorSlice {
  proposal: ProposalFields;
}

export const emptyProposal = () => {
  const getPropData = localStorage.getItem('propData');

  return getPropData
    ? JSON.parse(getPropData)
    : {
        title: '',
        who: '',
        what: '',
        tldr: '',
        links: '',
      };
};

const initialState: EditorSlice = {
  proposal: emptyProposal(),
};

const proposalSliceFactory =
  (fieldName: 'title' | 'who' | 'what' | 'tldr' | 'links') =>
  (state: EditorSlice, action: PayloadAction<string>) => {
    state.proposal[fieldName] = action.payload;
  };

export const editorSlice = createSlice({
  name: 'editor',
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
    updateProposalTitle: proposalSliceFactory('title'),
    updateProposalWho: proposalSliceFactory('who'),
    updateProposalWhat: proposalSliceFactory('what'),
    updateProposaltldr: proposalSliceFactory('tldr'),
    updateProposalLinks: proposalSliceFactory('links'),
    clearProposal: (state) => {
      state.proposal = emptyProposal();
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  updateProposal,
  patchProposal,
  clearProposal,
  updateProposalLinks,
  updateProposaltldr,
  updateProposalTitle,
  updateProposalWhat,
  updateProposalWho,
} = editorSlice.actions;

export default editorSlice.reducer;
