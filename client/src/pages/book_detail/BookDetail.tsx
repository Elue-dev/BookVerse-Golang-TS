import {
  InvalidateQueryFilters,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { MdDeleteForever, MdOutlineEditNote } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentUser,
  getUserToken,
  SAVE_URL,
} from "../../redux/slices/auth.slice";
import Notiflix from "notiflix";
import styles from "./book.detail.module.scss";
import PaystackPop from "@paystack/inline-js";
import { useEffect, useState } from "react";
import { SyncLoader } from "react-spinners";
import toast from "react-hot-toast";
import { httpRequest } from "../../services/httpRequest";
import { Book } from "../../types/books";
import { errorToast, successToast } from "../../utils/alerts";
import { User } from "../../types/user";
import { RootState } from "../../redux/store";
import Comments from "../../components/comments/Comments";
import { Transaction } from "../../types/transaction";
import { InfinitySpin } from "react-loader-spinner";
import PostContent from "../../components/FormatContent";

export default function BookDetail() {
  const { slug, bookId } = useParams();
  const [isPurchased, setIsPurchased] = useState(false);
  const currentUser: User | null = useSelector<RootState, User | null>(
    getCurrentUser
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const token = useSelector(getUserToken);

  const authHeaders = { headers: { authorization: `Bearer ${token}` } };

  const queryFn = async (): Promise<Book> => {
    const response = await httpRequest.get(`/books/${slug}/${bookId}`);
    return response.data.data;
  };

  const queryFnCat = async (): Promise<Book[]> => {
    const response = await httpRequest.get("/books");
    return response.data.data;
  };

  const queryFnT = async (): Promise<Transaction[]> => {
    const response = await httpRequest.get("/transactions", authHeaders);
    return response.data.data;
  };

  const {
    isLoading,
    error,
    data: book,
  } = useQuery<Book, Error>({
    queryKey: [`book-${slug}`],
    queryFn,
  });

  const { isLoading: tLoading, data: transactions } = useQuery<
    Transaction[],
    Error
  >({
    queryKey: [`transactions-${currentUser?.id}`],
    queryFn: queryFnT,
  });

  const { data: books } = useQuery<Book[], Error>({
    queryKey: [`books-${book?.category}`],
    queryFn: queryFnCat,
  });

  const queryClient = useQueryClient();

  const mutationFn = async (): Promise<string> => {
    await httpRequest.delete(`/books/${book?.id}`, authHeaders);
    return "Book deleted successfully";
  };

  const mutation = useMutation<string, Error, void, unknown>({
    mutationFn,
    onSuccess: (data: string) => {
      toast.dismiss();
      successToast(data);
      navigate("/");
      queryClient.invalidateQueries({
        queries: ["books"],
      } as InvalidateQueryFilters);
    },
    onError: (err: any) => {
      toast.dismiss();
      errorToast("Something went wrong");
      console.log("ERROR", err);
    },
  });

  const confirmDelete = () => {
    Notiflix.Confirm.show(
      "Delete Book",
      "Are you sure you want to delete this book?",
      "DELETE",
      "CLOSE",
      function okCb() {
        deleteBook();
      },
      function cancelCb() {},
      {
        width: "320px",
        borderRadius: "5px",
        titleColor: "#746ab0",
        okButtonBackground: "#746ab0",
        cssAnimationStyle: "zoom",
      }
    );
  };

  const deleteBook = async () => {
    toast.dismiss();
    toast.loading("Deleting book...");
    mutation.mutate();
  };

  const saveTransaction = async (tId: string) => {
    try {
      const response = await httpRequest.post(
        "/transactions",
        {
          book_id: book?.id,
          transaction_id: tId,
        },
        authHeaders
      );

      if (response.status === 200) {
        successToast(
          "Transaction successful. You would hear from us and get your book soon!"
        );
      }
    } catch (error) {
      errorToast("Something went wrong. Please try again.");
    }
  };

  const buyBook = () => {
    if (!currentUser) {
      errorToast("Please login to purchase book");
      dispatch(SAVE_URL(pathname));
      navigate("/auth");
      return;
    }

    const initiatePayment = () => {
      try {
        const paystack = new PaystackPop();
        paystack.newTransaction({
          key: import.meta.env.VITE_PAYSTACK_KEY,
          amount: (book?.price ?? 0) * 100,
          email: currentUser.email,
          name: currentUser.username,
          onSuccess() {
            saveTransaction(paystack.id);
            setIsPurchased(true);
          },
          onCancel() {
            errorToast("Transaction Cancelled ⛔️");
            // console.log("");
          },
        });
      } catch (err) {
        // console.log(err);
        errorToast("failed transaction" + err);
      }
    };
    initiatePayment();
  };

  const myTransactions = transactions?.filter(
    (t: Transaction) => t.book_slug === slug && t.user_id === currentUser?.id
  )[0];

  useEffect(() => {
    const userIds: string[] = [];
    transactions?.map((t: Transaction) => userIds.push(t.user_id));
    if (userIds.includes(currentUser?.id ?? "")) {
      setIsPurchased(true);
    } else {
      setIsPurchased(false);
    }
  }, [transactions, myTransactions, currentUser]);

  if (isLoading)
    return (
      <div className="loading">
        <SyncLoader color={"#746ab0"} />
      </div>
    );

  if (error)
    return <div className={styles["book_detail"]}>SOMETHING WENT WRONG...</div>;

  const similarBooks = (books ?? []).filter(
    (b: Book) => b.category === book?.category && b.id !== book?.id
  );

  return (
    <section className={styles["book_detail"]}>
      <div className={styles["left__section"]}>
        <h2>{book?.title}</h2>
        <br />
        <a href={book?.image}>
          <img
            src={book?.image}
            alt={book?.title}
            className={styles["book__img"]}
          />
        </a>

        <div className={styles["added__by"]}>
          <img
            src={book?.user_avatar}
            alt={book?.username}
            className={styles["user__img"]}
          />
          <div className={styles.user}>
            <b>{book?.username}</b>
            {currentUser?.id === book?.userId ? (
              <p>
                Added by you on{" "}
                {new Date(book?.created_at || Date.now()).toDateString()}
              </p>
            ) : (
              <p>
                Added on{" "}
                {new Date(book?.created_at || Date.now()).toDateString()}
              </p>
            )}
          </div>

          {currentUser?.id === book?.userId && (
            <div className={styles.actions}>
              <Link to="/add-book?action=edit" state={book}>
                <MdOutlineEditNote className={styles.edit} />
              </Link>
              <MdDeleteForever
                onClick={confirmDelete}
                className={styles.delete}
              />
            </div>
          )}
        </div>

        <div className={styles["book__details"]}>
          <p>
            <b>Genre:</b> {book?.category}
          </p>
          <p>
            <b>Price:</b> ₦
            {book?.price !== undefined
              ? new Intl.NumberFormat().format(book.price)
              : ""}
          </p>
          <br />

          <article>
            <PostContent content={book?.description} />
          </article>

          {tLoading ? (
            <div className="loading">
              <InfinitySpin width="200" color="#4fa94d" />
              <h3>GETTING TRANSACTIONS...</h3>
            </div>
          ) : (
            <>
              {myTransactions && isPurchased ? (
                <p className={styles.pdate}>
                  You purchased this book on{" "}
                  {new Date(myTransactions?.created_at).toDateString()}
                </p>
              ) : (
                <button className={styles["purchase__btn"]} onClick={buyBook}>
                  Buy Book
                </button>
              )}
            </>
          )}
        </div>

        <div className={styles["comments__container"]}>
          <Comments bookId={book?.id || undefined} />
        </div>
      </div>
      <div className={styles["right__section"]}>
        <h2>Similar Books</h2>
        {similarBooks?.length === 0 ? (
          <p>
            No similar book to <b style={{ color: "#746ab0" }}>{book?.title}</b>
          </p>
        ) : (
          similarBooks?.map((sb: Book) => (
            <Link key={sb.id} to={`/book/${sb.slug}/${sb.id}`}>
              <div className={styles.similar}>
                <img
                  src={sb.image}
                  alt={sb.title}
                  className={styles["s_book__img"]}
                />
                <h3>{sb.title}</h3>
                <p>
                  <b style={{ color: "dddddd" }}>Genre:</b> {sb.category}
                </p>
                <p>
                  <b>Price:</b> ₦{new Intl.NumberFormat().format(sb.price)}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
