import { useQuery } from "@tanstack/react-query";
import { BsFillCalendar2PlusFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import Select from "react-select";
import styles from "./books.module.scss";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import {
  selectFilteredBooks,
  SORT_BOOKS,
} from "../../redux/slices/filter.slice";
import { SyncLoader } from "react-spinners";
import { Book } from "../../types/books";
import { httpRequest } from "../../services/httpRequest";
import PostContent from "../../components/FormatContent";

type Option = {
  value: string;
  label: string;
};

const sortOptions = [
  { value: "latest", label: "Sorting: Latest" },
  { value: "lowest-price", label: "Sort by Lowest Price" },
  { value: "highest-price", label: "Sort by Highest Price" },
];

export default function Books() {
  const filteredBooks = useSelector(selectFilteredBooks);
  const [sort, setSort] = useState("latest");
  const dispatch = useDispatch();

  const queryFn = async (): Promise<Book[]> => {
    const response = await httpRequest.get("/books");
    return response.data.data;
  };

  const {
    isLoading,
    error,
    data: books,
  } = useQuery<Book[], Error>({
    queryKey: ["books"],
    queryFn,
  });

  useEffect(() => {
    dispatch(
      SORT_BOOKS({
        books,
        sort,
      })
    );
  }, [dispatch, books, sort]);

  if (error) return <div className={styles.books}>SOMETHING WENT WRONG."</div>;

  const handleSelectChange = (option: Option) => {
    setSort(option.value);
  };

  return (
    <div className={styles.books}>
      <h2>ALL BOOKS</h2>
      <label>
        <Select
          options={sortOptions}
          placeholder="Select sorting parameter"
          onChange={(option) => handleSelectChange(option as Option)}
          className={styles["select__purpose"]}
        />
      </label>
      {isLoading ? (
        <div className="loading">
          <SyncLoader color={"#746ab0"} />
        </div>
      ) : (
        <>
          <section className={styles["all__books"]}>
            {filteredBooks?.map((book: Book) => (
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
                  <article>
                    <PostContent
                      content={book.description.substring(0, 90) + "..."}
                    />
                  </article>
                  <div className={styles.bottom}>
                    <Link to={`/book/${book.slug}/${book.id}`}>
                      <button>See Details</button>
                    </Link>
                    <p>₦{new Intl.NumberFormat().format(book.price)}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
