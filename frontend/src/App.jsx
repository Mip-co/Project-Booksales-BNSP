import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import BookDetailPage from './pages/BookDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import Contact from './pages/Contact.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AuthorsPage from './pages/admin/AuthorsPage.jsx';
import BooksPage from './pages/admin/BooksPage.jsx';
import DashboardPage from './pages/admin/DashboardPage.jsx';
import GenresPage from './pages/admin/GenresPage.jsx';
import TransactionsPage from './pages/admin/TransactionsPage.jsx';
import UsersPage from './pages/admin/UsersPage.jsx';

/** Halaman belanja khusus guest & customer: Admin dialihkan ke dashboard. */
function CustomerOnly({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? <Navigate to="/admin/dashboard" replace /> : children;
}

function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Area publik & pelanggan (dengan Navbar) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route
          path="/cart"
          element={
            <CustomerOnly>
              <CartPage />
            </CustomerOnly>
          }
        />
        <Route
          path="/checkout"
          element={
            <CustomerOnly>
              <ProtectedRoute roles={['customer']}>
                <CheckoutPage />
              </ProtectedRoute>
            </CustomerOnly>
          }
        />
        <Route path="/contact" element={<Contact />} />
        {/* Dashboard User: tab "Info Akun" dan "Riwayat Pesanan" dalam satu halaman. */}
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Panel admin: sidebar 4 menu (menu 4 = grup master: user, genre, penulis) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="genres" element={<GenresPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="authors" element={<AuthorsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
