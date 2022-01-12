import { configureStore } from '@reduxjs/toolkit'
import backendReducer from './slices/backend'
import propHouseReducer from './slices/propHouse'
import configurationReducer from './slices/configuration'
import editorReducer from './slices/editor'

const store =  configureStore({
  reducer: {
		// backend: backendReducer,
		propHouse: propHouseReducer,
		configuration: configurationReducer,
		editor: editorReducer,
	}
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store
