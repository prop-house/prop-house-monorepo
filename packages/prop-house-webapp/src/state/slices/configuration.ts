import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { devBackendUri, prodBackendUri } from '../../config';

export interface ConfigurationSlice {
  etherscanHost: string;
  backendHost: string;
  displayAdmin: boolean;
}

const initialState: ConfigurationSlice = {
  etherscanHost: 'https://etherscan.io',
  backendHost:
    process.env.REACT_APP_NODE_ENV === 'production'
      ? prodBackendUri
      : devBackendUri,
  displayAdmin: process.env.REACT_APP_NODE_ENV === 'production' ? false : true,
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setDisplayAdmin: (state, action: PayloadAction<boolean>) => {
      state.displayAdmin = action.payload;
    },
    toggleDisplayAdmin: (state, action: PayloadAction<void>) => {
      state.displayAdmin = !state.displayAdmin;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setDisplayAdmin, toggleDisplayAdmin } = configSlice.actions;

export default configSlice.reducer;
