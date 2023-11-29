import { Link, useLocation } from "react-router-dom";
import { BiUserCircle, BiBookReader } from "react-icons/bi";
import { GoTriangleDown } from "react-icons/go";
import styles from "./header.module.scss";
import { useSelector } from "react-redux";
import { getCurrentUser } from "../../redux/slices/auth.slice";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { httpRequest } from "../../services/httpRequest";
import { Book } from "../../types/books";
import { RootState } from "../../redux/store";
import { User } from "../../types/user";

export default function Header() {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Book[] | undefined>([]);
  const currentUser: User | null = useSelector<RootState, User | null>(
    getCurrentUser
  );

  const queryFn = async (): Promise<Book[]> => {
    const response = await httpRequest.get("/books");
    return response.data.data;
  };

  const { data: books } = useQuery<Book[], Error>({
    queryKey: ["books"],
    queryFn,
  });

  if (location.pathname.includes("auth")) return;

  const getBooks = async () => {
    const filteredBooks = books?.filter(
      (book: Book) =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.category.toLowerCase().includes(search.toLowerCase())
    );

    setResults(filteredBooks);
  };

  const clearFields = () => {
    setSearch("");
    setResults([]);
  };

  return (
    <header>
      <div className={styles.logo}>
        <Link to="/">
          <BiBookReader />
          <p>BookVerse</p>
        </Link>
      </div>

      <div className={styles.search}>
        <input
          type="search"
          placeholder="Search book by title or genre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onInput={getBooks}
        />
        {search && (
          <div className={styles["search__results"]}>
            {results?.length === 0 && <p>No Books Found.</p>}
            {results?.map((book) => (
              <Link
                key={book.id}
                to={`/book/${book.slug}`}
                onClick={clearFields}
              >
                <div className={styles["search__details"]}>
                  <img src={book.image} />
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

      <div className={styles["user__section"]}>
        {currentUser ? (
          <Link to="/dashboard">
            <img src={currentUser.avatar} alt={currentUser.username} />
          </Link>
        ) : (
          <Link to="/auth">
            <BiUserCircle className={styles.user} />
          </Link>
        )}
        {currentUser && (
          <span className={styles.dropdown}>
            <GoTriangleDown />
          </span>
        )}
      </div>
    </header>
  );
}
