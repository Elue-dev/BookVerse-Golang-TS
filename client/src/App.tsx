import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Unauthenticated from "./components/protect_routes/unauthenticated";

const Home = lazy(() => import("./pages/home/Home"));
const Auth = lazy(() => import("./pages/auth/Auth"));

function App() {
  return (
    <div className="app">
      <Toaster />
      <BrowserRouter>
        {/* <Header />
        <Navlinks />
        <ScrollToTop /> */}
        <div className="main">
          <Suspense
            fallback={
              <div className="loading suspense">
                <div>{/* <BiBookReader />{" "} */}</div>
                <h2>BOOKVERSE...</h2>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/auth"
                element={
                  // <Unauthenticated>
                  <Auth />
                  // </Unauthenticated>
                }
              />
              {/* <Route
                path="/auth"
                element={
                  <Unauthenticated>
                    <Auth />
                  </Unauthenticated>
                }
              />
              <Route path="/book/:slug" element={<BookDetail />} />
              <Route path="/books" element={<Books />} />

              <Route path="/add-book" element={<AddBook />} />

              <Route
                path="/dashboard"
                element={
                  <Authenticated>
                    <Dashboard />
                  </Authenticated>
                }
              />
              <Route path="*" element={<ErrorPage />} /> */}
            </Routes>
          </Suspense>
        </div>

        {/* <Footer /> */}
      </BrowserRouter>
    </div>
  );
}

export default App;
