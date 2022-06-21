import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ConfigurationSlice {
  etherscanHost: string;
  backendHost: string;
  displayAdmin: boolean;
}

const initialState: ConfigurationSlice = {
  etherscanHost: 'https://etherscan.io',
  backendHost:
    process.env.REACT_APP_NODE_ENV === 'production' &&
    process.env.REACT_APP_PROD_BACKEND_URI
      ? process.env.REACT_APP_PROD_BACKEND_URI
      : process.env.REACT_APP_NODE_ENV === 'development' &&
        process.env.REACT_APP_DEV_BACKEND_URI
      ? process.env.REACT_APP_DEV_BACKEND_URI
      : 'http://localhost:3000',
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
