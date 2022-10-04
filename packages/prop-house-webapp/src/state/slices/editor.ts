import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProposalFields } from '../../utils/proposalFields';

export interface EditorSlice {
  proposal: ProposalFields;
}

export const emptyProposal = () => ({
  title: '',
  what: '',
  tldr: '',
});

const initialState: EditorSlice = {
  proposal: emptyProposal(),
};

const proposalSliceFactory =
  (fieldName: 'title' | 'what' | 'tldr') => (state: EditorSlice, action: PayloadAction<string>) => {
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
    updateProposalWhat: proposalSliceFactory('what'),
    updateProposaltldr: proposalSliceFactory('tldr'),
    clearProposal: state => {
      state.proposal = emptyProposal();
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  updateProposal,
  patchProposal,
  clearProposal,
  updateProposaltldr,
  updateProposalTitle,
  updateProposalWhat,
} = editorSlice.actions;

export default editorSlice.reducer;
