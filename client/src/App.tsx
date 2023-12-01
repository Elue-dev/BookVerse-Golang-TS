import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/header/Header";
import BookDetail from "./pages/book_detail/BookDetail";
import Authenticated from "./components/protect_routes/authenticated";
import Navlinks from "./components/nav_links/Navlinks";
import ScrollToTop from "./utils/scrollToTop";
import Unauthenticated from "./components/protect_routes/unauthenticated";
import Footer from "./components/footer/Footer";
import { BiBookReader } from "react-icons/bi";

const Home = lazy(() => import("./pages/home/Home"));
const Auth = lazy(() => import("./pages/auth/Auth"));
const Books = lazy(() => import("./pages/books/Books"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const AddBook = lazy(() => import("./pages/add_book/AddBook"));

function App() {
  return (
    <div className="app">
      <Toaster />
      <BrowserRouter>
        <Header />
        <Navlinks />
        <ScrollToTop />
        <div className="main">
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
              {/* <Route
                path="/auth"
                element={
                  <Unauthenticated>
                    <Auth />
                  </Unauthenticated>
                }
              />


              <Route path="*" element={<ErrorPage />} /> */}
            </Routes>
          </Suspense>
        </div>

        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
