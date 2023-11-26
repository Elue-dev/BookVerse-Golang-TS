import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Book } from "../../types/books";

const initialState = {
  books: [],
};

const filter_slice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    SORT_BOOKS: (state, action) => {
      const { books, sort } = action.payload;

      let filteredBooks = [];

      switch (sort) {
        case "latest":
          filteredBooks = books;
          break;
        case "lowest-price":
          filteredBooks = books.slice().sort((a: Book, b: Book) => {
            return a.price - b.price;
          });
          break;
        case "highest-price":
          filteredBooks = books.slice().sort((a: Book, b: Book) => {
            return b.price - a.price;
          });
          break;
        default:
          filteredBooks = books;
      }
      state.books = filteredBooks;
    },
  },
});

export const { SORT_BOOKS } = filter_slice.actions;

export const selectFilteredBooks = (state: RootState) => state.filter.books;

export default filter_slice.reducer;
