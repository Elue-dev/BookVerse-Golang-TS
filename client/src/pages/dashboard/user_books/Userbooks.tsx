import { useQuery } from "@tanstack/react-query";
import styles from "./user.books.module.scss";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserToken } from "../../../redux/slices/auth.slice";
import moment from "moment";
import { User } from "../../../types/user";
import { httpRequest } from "../../../services/httpRequest";
import { Book } from "../../../types/books";
import { Transaction } from "../../../types/transaction";

export default function UserBooks({
  currentUser,
}: {
  currentUser: User | null;
}) {
  const token = useSelector(getUserToken);
  const authHeaders = { headers: { authorization: `Bearer ${token}` } };

  const queryFn = async (): Promise<Book[]> => {
    const response = await httpRequest.get(
      `/books/user/${currentUser?.id}`,
      authHeaders
    );
    return response.data.data;
  };

  const queryFnT = async (): Promise<Transaction[]> => {
    const response = await httpRequest.get("/transactions", authHeaders);
    return response.data.data;
  };

  const {
    isLoading,
    error,
    data: books,
  } = useQuery<Book[], Error>({
    queryKey: [`books-${currentUser?.id}`],
    queryFn,
  });

  const { data: transactions, isLoading: tLoading } = useQuery<
    Transaction[],
    Error
  >({
    queryKey: [`transactions-${currentUser?.id}`],
    queryFn: queryFnT,
  });

  if (isLoading)
    return (
      <div className="loading" style={{ color: "#746ab0" }}>
        LOADING YOUR BOOKS...
      </div>
    );

  if (error) return "SOMETHING WENT WRONG......";

  return (
    <section className={styles["user__books"]}>
      <h2>Books you've added</h2>
      {books?.length === 0 ? (
        <p>
          You have not added any book on BookVerse.{" "}
          <Link to="/add-book?action=new">
            <b style={{ color: "#746ab0" }}>Start adding some</b>{" "}
          </Link>
        </p>
      ) : (
        <p>
          You have added{" "}
          <b style={{ color: "#746ab0" }}>
            {books?.length} {books?.length == 1 ? "book" : "books"}
          </b>{" "}
          to BookVerse
        </p>
      )}
      {books?.map((book) => (
        <Link to={`/book/${book.slug}/${book.id}`} key={book.id}>
          <div className={styles["book__details"]}>
            <img src={book.image} />
            <div>
              <h3>{book.title}</h3>
              <p>
                <b>Genre:</b> {book.category}
              </p>
              <p>
                <b>Price:</b> ₦{new Intl.NumberFormat().format(book.price)}
              </p>
              <p>
                <b>Added:</b> {new Date(book.created_at).toDateString()}
              </p>
            </div>
          </div>
        </Link>
      ))}
      <br />
      <h2>Books you've purchased</h2>
      {tLoading && <p className="loading">Loading Books...</p>}
      {!tLoading && (
        <>
          {transactions && transactions.length > 0 ? (
            <p>
              You have purchased{" "}
              <b style={{ color: "#746ab0" }}>
                {transactions?.length}{" "}
                {transactions?.length === 1 ? "book" : "books"}{" "}
              </b>{" "}
              on BookVerse.
            </p>
          ) : (
            <p>You have not purchased any book on BookVerse.</p>
          )}

          {transactions?.map((transaction) => (
            <Link
              to={`/book/${transaction.book_slug}/${transaction.book_id}`}
              key={transaction.transaction_id}
            >
              <div className={styles["book__details"]}>
                <img src={transaction.book_img} />
                <div>
                  <h3>{transaction.book_title}</h3>
                  <p>
                    <b>Genre:</b> {transaction.book_category}
                  </p>
                  <p>
                    <b>Price:</b> ₦
                    {new Intl.NumberFormat().format(transaction.book_price)}
                  </p>
                  <p>
                    <b>Purchased:</b> {moment(transaction.created_at).fromNow()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </>
      )}
    </section>
  );
}
