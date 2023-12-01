import { useEffect, useState } from "react";
import {
  InvalidateQueryFilters,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { BsDot } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";
import {
  MdDeleteForever,
  MdOutlineArrowDropUp,
  MdOutlineEditNote,
} from "react-icons/md";
import { CiClock2 } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import styles from "./comments.module.scss";
import {
  getCurrentUser,
  getUserToken,
  SAVE_URL,
} from "../../redux/slices/auth.slice";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Comment } from "../../types/comments";
import { errorToast, successToast } from "../../utils/alerts";
import { httpRequest } from "../../services/httpRequest";
import { RootState } from "../../redux/store";
import { User } from "../../types/user";

import moment from "moment";

export default function Comments({ bookId }: { bookId: string | undefined }) {
  const currentUser: User | null = useSelector<RootState, User | null>(
    getCurrentUser
  );
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState("");
  const [commentState, setCommentState] = useState("New");
  const token = useSelector(getUserToken);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const authHeaders = { headers: { authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (text === "") {
      setCommentState("New");
    }
  }, [text]);

  const queryFn = async (): Promise<Comment[]> => {
    const response = await httpRequest.get(
      `/comments/book/${bookId}`,
      authHeaders
    );
    return response.data.data;
  };

  const {
    isLoading,
    error,
    data: comments,
  } = useQuery<Comment[], Error>({
    queryKey: [`comment-${bookId}`],
    queryFn,
  });

  const queryClient = useQueryClient();

  const mutationFn = async (data: AddComment): Promise<string> => {
    await httpRequest.post(
      `/comments`,
      { message: data.message, book_id: data.book_id },
      authHeaders
    );
    return "Comment added successfully";
  };

  type AddComment = {
    message: string;
    book_id: string;
  };
  const mutation = useMutation<string, Error, AddComment, unknown>({
    mutationFn,
    onSuccess: (data: string) => {
      toast.dismiss();
      successToast(data);
      queryClient.invalidateQueries({
        queries: [`comment-${bookId}`],
      } as InvalidateQueryFilters);
    },
    onError: (err: any) => {
      toast.dismiss();
      errorToast("Something went wrong");
      console.log("ERROR", err);
    },
  });

  const addComment = () => {
    if (!text) return errorToast("Please add your comment");
    toast.loading("Adding comment...");
    mutation.mutateAsync({
      message: text,
      book_id: bookId || "",
    });
    setText("");
  };

  const editComment = () => {};

  const redirect = () => {
    dispatch(SAVE_URL(pathname));
    navigate("/auth");
  };

  if (isLoading) return "Loading...";

  if (error) return "Something went wrong";

  return (
    <section className={styles.comments}>
      <div className={styles.header}>
        <b>
          {comments?.length} {comments?.length === 1 ? "Comment" : "Comments"}
        </b>{" "}
        <BsDot />{" "}
        <span onClick={() => setShowComments(!showComments)}>
          {showComments ? "Hide comments" : "Show more"}{" "}
          {showComments ? <MdOutlineArrowDropUp /> : <IoMdArrowDropdown />}
        </span>
        {!currentUser && (
          <div className={styles.nouser} onClick={redirect}>
            <p>Login to comment</p>
          </div>
        )}
      </div>

      {showComments && (
        <>
          <div className={styles["comments__section"]}>
            {currentUser && (
              <div>
                <img src={currentUser?.avatar} alt={currentUser?.username} />
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add a comment..."
                />

                <button
                  onClick={
                    commentState === "New"
                      ? () => addComment()
                      : () => editComment()
                  }
                  disabled={mutation.isPending}
                >
                  {mutation.isPending
                    ? "Adding..."
                    : commentState === "New"
                    ? "Submit"
                    : "Edit"}
                </button>
              </div>
            )}
          </div>
          <div className={styles["book__comments"]}>
            {comments?.length === 0 || comments == null ? (
              <>
                <h3>No comments yet</h3>
                <p>Be the first to add a comment to this book</p>
              </>
            ) : (
              <>
                {comments?.map((comment: Comment) => (
                  <div className={styles["comment__details"]} key={comment.id}>
                    <img src={comment.user_img} alt={comment.username} />
                    <div>
                      <p>
                        <b>{comment.username}</b>
                      </p>
                      <p className={styles.username}>{comment.message}</p>
                    </div>
                    <div className={styles.date}>
                      <CiClock2 />
                      {moment(comment.created_at).fromNow()}
                    </div>
                    {comment.user_id === currentUser?.id && (
                      <div>
                        <span
                          onClick={() => {
                            setText(comment.message);
                            setCommentState("Editing");
                          }}
                        >
                          <MdOutlineEditNote
                            size={25}
                            className={styles.edit}
                          />
                        </span>
                        <span>
                          <MdDeleteForever
                            size={25}
                            className={styles.delete}
                          />
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
