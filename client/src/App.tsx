import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route, useNavigate } from "react-router-dom";
import Header from "./components/header/Header";
import BookDetail from "./pages/book_detail/BookDetail";
import Authenticated from "./components/protect_routes/authenticated";
import Navlinks from "./components/nav_links/Navlinks";
import ScrollToTop from "./utils/scrollToTop";
import Unauthenticated from "./components/protect_routes/unauthenticated";
import Footer from "./components/footer/Footer";
import { BiBookReader } from "react-icons/bi";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/not_found/NotFound";
import { httpRequest } from "./services/httpRequest";
import { useDispatch, useSelector } from "react-redux";
import { getUserToken, REMOVE_ACTIVE_USER } from "./redux/slices/auth.slice";
import ResetPassword from "./pages/auth/ResetPassword";
const Home = lazy(() => import("./pages/home/Home"));
const Auth = lazy(() => import("./pages/auth/Auth"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const Books = lazy(() => import("./pages/books/Books"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const AddBook = lazy(() => import("./pages/add_book/AddBook"));

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector(getUserToken);

  const authHeaders = {
    headers: { authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    async function checkAuthStatus() {
      if (token !== null) {
        try {
          await httpRequest.post("/auth/checkAuthStatus", null, authHeaders);
        } catch (error: any) {
          if (error.response.data.error_details === "token malformed") {
            dispatch(REMOVE_ACTIVE_USER());
            navigate("/auth");
          }
        }
      }
    }

    checkAuthStatus();
  }, []);

  return (
    <div className="app">
      <Toaster />

      <Header />
      <Navlinks />
      <ScrollToTop />

      <div className="main">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="loading suspense">
                <div>
                  <BiBookReader />
                </div>
                <h2>BOOKVERSE...</h2>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/auth"
                element={
                  <Unauthenticated>
                    <Auth />
                  </Unauthenticated>
                }
              />
              <Route
                path="/auth/forgot-password"
                element={
                  <Unauthenticated>
                    <ForgotPassword />
                  </Unauthenticated>
                }
              />
              <Route
                path="/auth/reset-password/:t/:u"
                element={
                  <Unauthenticated>
                    <ResetPassword />
                  </Unauthenticated>
                }
              />
              <Route path="/book/:slug/:bookId" element={<BookDetail />} />
              <Route path="/books" element={<Books />} />
              <Route
                path="/dashboard"
                element={
                  <Authenticated>
                    <Dashboard />
                  </Authenticated>
                }
              />
              <Route path="/add-book" element={<AddBook />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>

      <Footer />
    </div>
  );
}

export default App;
