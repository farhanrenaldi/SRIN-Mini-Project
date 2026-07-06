import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BooksPage from './pages/BooksPage.jsx';
import AuthorsPage from './pages/AuthorsPage.jsx';
import MembersPage from './pages/MembersPage.jsx';
import BorrowedBooksPage from './pages/BorrowedBooksPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="authors" element={<AuthorsPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="borrowed-books" element={<BorrowedBooksPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
