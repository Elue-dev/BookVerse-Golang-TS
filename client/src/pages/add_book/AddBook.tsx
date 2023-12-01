import { ChangeEvent, useEffect, useRef, useState } from "react";
import { TfiImage } from "react-icons/tfi";
import {
  InvalidateQueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from "./add.book.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentUser,
  getUserToken,
  SAVE_URL,
} from "../../redux/slices/auth.slice";
import toast from "react-hot-toast";
import { errorToast, successToast } from "../../utils/alerts";
import { httpRequest } from "../../services/httpRequest";
import { Book } from "../../types/books";

export default function AddBook() {
  const currentUser = useSelector(getCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    setTimeout(() => {
      if (!currentUser) {
        dispatch(SAVE_URL(pathname));
        navigate("/auth");
        return;
      }
    }, 500);
  }, []);

  const state = useLocation().state;
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setSelectedCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef<any>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const token = useSelector(getUserToken);
  const authHeaders = { headers: { authorization: `Bearer ${token}` } };

  const queryString = useLocation().search;
  const queryParams = new URLSearchParams(queryString);
  const action = queryParams.get("action");

  useEffect(() => {
    switch (action) {
      case "new":
        setTitle("");
        setDescription("");
        setPrice("");
        setSelectedCategory("");
        break;
      case "edit":
        setTitle(state?.title);
        setDescription(state?.description);
        setPrice(state?.price);
        setSelectedCategory(state?.category);
        setImagePreview(state?.image);
        break;
      default:
        "";
    }
  }, [action]);

  type BookFields = {
    title: string;
    description: string;
    category: string;
    price: string;
  };

  const parseText = (html: string | null) => {
    const value = new DOMParser().parseFromString(html!, "text/html");
    return value.body.textContent;
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    file && setImage(file);
    file && setImagePreview(URL.createObjectURL(file));
  };

  const categories = [
    "Fantasy",
    "Mystery",
    "Sci-Fi",
    "Thriller",
    "Contemporary",
    "Poetry",
    "Fiction",
    "Drama",
  ];

  const queryClient = useQueryClient();

  const mutationFn = async (newBook: FormData): Promise<Book> => {
    const response = await httpRequest.post(`/books`, newBook, authHeaders);
    return response.data.data;
  };

  const mutationFnUpdate = async (updatedBook: FormData): Promise<Book> => {
    const response = await httpRequest.put(
      `/books/${state.id}`,
      updatedBook,
      authHeaders
    );
    return response.data.data;
  };

  const addBookMutation = useMutation<Book, Error, FormData, unknown>({
    mutationFn,
    onSuccess: () => {
      toast.dismiss();
      successToast("Book added successfully");
      queryClient.invalidateQueries({
        queries: ["books"],
      } as InvalidateQueryFilters);
    },
    onError: (err: any) => {
      toast.dismiss();
      setLoading(false);
      errorToast("Something went wrong");
      console.log("ERROR", err);
    },
  });

  const updateBookMutation = useMutation<Book, Error, FormData, unknown>({
    mutationFn: mutationFnUpdate,
    onSuccess: () => {
      toast.dismiss();
      successToast("Book updated successfully");
      queryClient.invalidateQueries({
        queries: ["books"],
      } as InvalidateQueryFilters);
    },
    onError: (err: any) => {
      toast.dismiss();
      setLoading(false);
      errorToast("Something went wrong");
      console.log("ERROR", err);
    },
  });

  const addBook = async () => {
    toast.dismiss();

    if (title && !/^[A-Za-z0-9\s]+$/.test(title))
      return errorToast("Book title contains unwanted characters");

    const fields = { title, description, category, price, image };
    const missingFields: string[] = [];

    for (const field in fields) {
      if (!fields[field as keyof BookFields]) missingFields.push(field);
    }

    if (missingFields.length > 0)
      return errorToast(
        `${missingFields.join(", ")} ${
          missingFields.length > 1 ? "are" : "is"
        } required`
      );

    const convertedPrice = parseFloat(price);

    if (isNaN(convertedPrice) || !Number.isFinite(convertedPrice))
      return errorToast("price must be a number");

    setLoading(true);

    toast.loading("Adding book...");

    const formData = new FormData();
    formData.append("title", title);
    const parsedDescription: string | null = parseText(description);
    if (parsedDescription !== null) {
      formData.append("description", parsedDescription);
    } else {
      formData.append("description", "");
    }
    formData.append("price", price);
    formData.append("category", category);
    if (image) {
      formData.append("image", image);
    } else {
      formData.append("image", "");
    }

    await addBookMutation.mutateAsync(formData);
    setLoading(false);
    setImage(null);
    setImagePreview(null);
    navigate("/");
  };

  const updateBook = async () => {
    toast.dismiss();
    const fields = { title, description, category, price };

    if (title && !/^[A-Za-z0-9\s]+$/.test(title))
      return errorToast("Book title contains unwanted characters");

    const missingFields: string[] = [];

    for (const field in fields) {
      if (!fields[field as keyof BookFields]) missingFields.push(field);
    }

    if (missingFields.length > 0)
      return errorToast(
        `${missingFields.join(", ")} ${
          missingFields.length > 1 ? "are" : "is"
        } required`
      );

    const convertedPrice = parseFloat(price);

    if (isNaN(convertedPrice) || !Number.isFinite(convertedPrice))
      return errorToast("price must be a number");

    setLoading(true);
    toast.loading("Updating book...");

    const formData = new FormData();
    formData.append("title", title);
    const parsedDescription: string | null = parseText(description);
    if (parsedDescription !== null) {
      formData.append("description", parsedDescription);
    } else {
      formData.append("description", "");
    }
    formData.append("price", price);
    formData.append("category", category);
    if (image) {
      formData.append("image", image);
    } else {
      formData.append("image", "");
    }

    await updateBookMutation.mutateAsync(formData);
    setLoading(false);
    setImage(null);
    setImagePreview(null);
    navigate("/");
  };

  return (
    <section className={styles["add__book"]}>
      <div className={styles["left__section"]}>
        <div className={styles.top}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Book title..."
          />
          <input
            type="number"
            value={price}
            min={1}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Book price..."
          />
        </div>
        <div className={styles["editor__cont"]}>
          <ReactQuill
            theme="snow"
            className={styles.editor}
            value={description}
            onChange={setDescription}
            placeholder="Enter book description here..."
          />
        </div>
      </div>
      <div className={styles["right__section"]}>
        {state ? (
          <>
            <img
              className={styles.bookimg}
              src={imagePreview ? imagePreview : state.bookimg}
            />
            <p onClick={() => imageRef.current.click()}>Change Image</p>
            <input
              type="file"
              onChange={(e) => handleImageChange(e)}
              accept="image/*"
              className={styles["image__upload"]}
              style={{ display: "none" }}
              ref={imageRef}
              name="image"
              id="image"
            />
          </>
        ) : (
          <form className={styles.container}>
            <div onClick={() => imageRef.current.click()}>
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt={title}
                    className={styles.preview}
                  />
                  <p>Change Image</p>
                  <input
                    type="file"
                    onChange={(e) => handleImageChange(e)}
                    accept="image/*"
                    className={styles["image__upload"]}
                    style={{ display: "none" }}
                    ref={imageRef}
                    name="image"
                    id="image"
                  />
                </>
              ) : (
                <>
                  <TfiImage className={styles["image__icon"]} />
                  <p style={{ textAlign: "center" }}>Add Book Image</p>
                  <input
                    type="file"
                    onChange={(e) => handleImageChange(e)}
                    accept="image/*"
                    className={styles["image__upload"]}
                    ref={imageRef}
                    name="image"
                    id="image"
                  />
                </>
              )}
            </div>
          </form>
        )}

        <div className={styles.genres}>
          <h4>Select Book Genre</h4>
          <div className={styles.genre}>
            {categories?.map((cat: string) => (
              <div key={cat}>
                <input
                  type="radio"
                  value={cat}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  checked={category === cat}
                />{" "}
                {cat}
              </div>
            ))}
          </div>

          <div className={styles["add__btn"]}>
            {loading ? (
              <button type="button" disabled>
                <PulseLoader loading={loading} size={10} color={"#746ab0"} />
              </button>
            ) : (
              <button onClick={state ? updateBook : addBook}>
                {state ? "Update Book" : "Add Book"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
