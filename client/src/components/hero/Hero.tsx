import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { CLOSE_MODAL, modalState } from "../../redux/slices/modal.slice";
import styles from "./hero.module.scss";
import { httpRequest } from "../../services/httpRequest";
import { Book } from "../../types/books";

export default function Hero() {
  const modal = useSelector(modalState);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Book[] | undefined>([]);
  const dispatch = useDispatch();

  const queryFn = async (): Promise<Book[]> => {
    const response = await httpRequest.get("/books");
    console.log("books", response.data.books);
    return response.data.books;
  };

  const {
    isLoading,
    error,
    data: books,
  } = useQuery<Book[], Error>({
    queryKey: ["books"],
    queryFn,
  });

  const getBooks = async () => {
    const filteredBooks = books?.filter(
      (book: Book) =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.category.toLowerCase().includes(search.toLowerCase())
    );

    setSearchResults(filteredBooks);
  };

  const clearFields = () => {
    setSearch("");
    setSearchResults([]);
    dispatch(CLOSE_MODAL());
  };

  if (error) {
    return <h3>Something went wrong</h3>;
  }

  return (
    <section className={styles.hero}>
      {modal && (
        <div
          className={
            modal ? ` ${styles.modal} ${styles.active}` : `${styles.modal}`
          }
        >
          <input
            type="text"
            placeholder="Seach books by title or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onInput={getBooks}
          />

          {isLoading && <div className="loading">Loading...</div>}

          {search && (
            <div className={styles["search__results"]}>
              {searchResults?.length === 0 && (
                <p style={{ color: "#fff" }}>No Books Found.</p>
              )}
              {searchResults?.map((book) => (
                <Link
                  key={book.id}
                  to={`/book/${book.slug}`}
                  onClick={clearFields}
                >
                  <div className={styles["search__details"]}>
                    <img src={book.img} />
                    <div>
                      <p>{book.title}</p>
                      <p>₦{book.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
      <div className={styles["hero__content"]}>
        <h1>Up to 80% Off</h1>
        <p>Let's find the perfect book for you</p>
        <Link to="/books">
          <button>See Books</button>
        </Link>
      </div>
    </section>
  );
}
