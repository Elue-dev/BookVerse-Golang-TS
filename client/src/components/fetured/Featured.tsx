import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import styles from "./featured.module.scss";
import { Link } from "react-router-dom";
import { BsFillCalendar2PlusFill } from "react-icons/bs";
import { FaQuoteLeft } from "react-icons/fa";
import image from "../../assets/image1.jpg";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { CLOSE_MODAL } from "../../redux/slices/modal.slice";
import { httpRequest } from "../../services/httpRequest";
import { Book } from "../../types/books";

export default function Featured() {
  const dispatch = useDispatch();

  const queryFn = async (): Promise<Book[]> => {
    const response = await httpRequest.get("/books");
    return response.data.data;
  };

  const {
    data: books,
    error,
    isLoading,
  } = useQuery<Book[], Error>({
    queryKey: ["books"],
    queryFn,
  });

  useEffect(() => {
    dispatch(CLOSE_MODAL());
  }, []);

  if (error)
    return <div className={styles.featured}>SOMETHING WENT WRONG...</div>;

  // if loading ???

  return (
    <section className={styles.featured}>
      <div>
        <p>
          <FaQuoteLeft /> &nbsp;
          <span>
            {" "}
            One glance at a book and you hear the voice of another person,
            perhaps someone dead for 1,000 years. To read is to voyage through
            time. – <b style={{ color: "#746ab0" }}>Carl Sagan</b>
          </span>
        </p>
        <img src={image} alt="" />
      </div>
      <h2>FEATURED BOOKS</h2>
      <section className={styles["featured__books"]}>
        {isLoading ? (
          <div className="loading">LOADING...</div>
        ) : (
          <>
            {books?.slice(0, 3).map((book) => (
              <div className={styles["books__card"]} key={book.id}>
                <div>
                  <img src={book.image} alt="" />
                </div>
                <div className={styles["book__details"]}>
                  <h3>{book.title}</h3>
                  <p>
                    <BsFillCalendar2PlusFill />{" "}
                    {moment(book.created_at).fromNow()}
                  </p>
                  <p>{book.description.substring(0, 90)}...</p>
                  <div className={styles.bottom}>
                    <Link to={`/book/${book.slug}/${book.id}`}>
                      <button>See Details</button>
                    </Link>
                    <p>₦{new Intl.NumberFormat().format(book.price)}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </section>
    </section>
  );
}
