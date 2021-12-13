import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ConfigurationSlice {
  etherscanHost: string;
}

const initialState: ConfigurationSlice = {
  etherscanHost: "https://etherscan.io"
}

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
  }
})

// Action creators are generated for each case reducer function
export const { } = configSlice.actions

export default configSlice.reducer