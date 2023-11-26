import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

const initialState = {
  isLoggedIn: false,
  user: null,
  previousURL: null,
  token: null,
};

const auth_slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    SET_ACTIVE_USER: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload;
    },
    SET_USER_TOKEN: (state, action) => {
      state.token = action.payload;
    },
    REMOVE_ACTIVE_USER: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
    },
    SAVE_URL: (state, action) => {
      state.previousURL = action.payload;
    },
  },
});

export const { SET_ACTIVE_USER, REMOVE_ACTIVE_USER, SAVE_URL, SET_USER_TOKEN } =
  auth_slice.actions;

export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const getCurrentUser = (state: RootState) => state.auth.user;
export const getUserToken = (state: RootState) => state.auth.token;
export const selectPreviousURL = (state: RootState) => state.auth.previousURL;

export default auth_slice.reducer;
