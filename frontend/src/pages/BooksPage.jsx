import { useEffect, useMemo, useState } from 'react';
import { booksApi, authorsApi } from '../api/resources.js';
import { extractError, extractFieldErrors } from '../api/client.js';
import { usePagedData } from '../hooks/usePagedData.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useOptions } from '../hooks/useOptions.js';
import { useToast } from '../components/Toast.jsx';
import { Card, Toolbar } from '../components/page.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { SearchBar } from '../components/SearchBar.jsx';
import { Modal } from '../components/Modal.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { Button, Badge, Spinner } from '../components/primitives.jsx';
import { TextField, NumberField, SelectField } from '../components/Field.jsx';
import { PlusIcon } from '../components/Icons.jsx';

const PAGE_SIZE = 10;
const emptyForm = { title: '', authorId: '', category: '', publishingYear: '', isbn: '' };

export default function BooksPage() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput);
  const [refreshKey, setRefreshKey] = useState(0);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const { options: authors, loading: authorsLoading } = useOptions(authorsApi.all, refreshKey);

  useEffect(() => setPage(0), [search]);

  const params = useMemo(
    () => ({ page, size: PAGE_SIZE, search: search || undefined }),
    [page, search],
  );
  const { data, loading, error } = usePagedData(booksApi.list, params, refreshKey);

  const refresh = () => setRefreshKey((k) => k + 1);

  const openCreate = () => {
    setEditing({});
    setForm(emptyForm);
    setErrors({});
  };

  const openEdit = (book) => {
    setEditing(book);
    setForm({
      title: book.title ?? '',
      authorId: book.author?.id ?? '',
      category: book.category ?? '',
      publishingYear: book.publishingYear ?? '',
      isbn: book.isbn ?? '',
    });
    setErrors({});
  };

  const closeForm = () => {
    if (!saving) setEditing(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = {
      title: form.title.trim(),
      authorId: form.authorId ? Number(form.authorId) : null,
      category: form.category.trim() || null,
      publishingYear: form.publishingYear === '' ? null : Number(form.publishingYear),
      isbn: form.isbn.trim() || null,
    };
    try {
      if (editing.id) {
        await booksApi.update(editing.id, payload);
        toast.success('Book updated');
      } else {
        await booksApi.create(payload);
        toast.success('Book added');
      }
      setEditing(null);
      refresh();
    } catch (err) {
      const fieldErrors = extractFieldErrors(err);
      if (fieldErrors) setErrors(fieldErrors);
      else toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await booksApi.remove(deleting.id);
      toast.success('Book deleted');
      setDeleting(null);
      if (data.content.length === 1 && page > 0) setPage((p) => p - 1);
      else refresh();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleteBusy(false);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (b) => <span className="font-medium text-slate-800">{b.title}</span>,
    },
    { key: 'author', header: 'Author', render: (b) => b.author?.name || '—' },
    {
      key: 'category',
      header: 'Category',
      render: (b) => (b.category ? <Badge>{b.category}</Badge> : '—'),
    },
    { key: 'publishingYear', header: 'Year', render: (b) => b.publishingYear || '—' },
    { key: 'isbn', header: 'ISBN', render: (b) => <span className="text-slate-500">{b.isbn || '—'}</span> },
  ];

  const noAuthors = !authorsLoading && authors.length === 0;

  return (
    <div>
      <Toolbar description="Manage the books in your catalog.">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by title, category, ISBN, author…"
          className="sm:w-80"
        />
        <Button onClick={openCreate} disabled={noAuthors} title={noAuthors ? 'Add an author first' : undefined}>
          <PlusIcon /> Add Book
        </Button>
      </Toolbar>

      {noAuthors && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Add at least one author before creating books.
        </div>
      )}

      <Card>
        <DataTable
          columns={columns}
          rows={data.content}
          loading={loading}
          error={error}
          onEdit={openEdit}
          onDelete={setDeleting}
          empty={{
            title: 'No books found',
            description: search ? 'Try a different search term.' : 'Add your first book to get started.',
          }}
        />
        {!loading && !error && (
          <Pagination
            page={data.page}
            size={data.size}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            onChange={setPage}
          />
        )}
      </Card>

      <Modal
        open={editing !== null}
        title={editing?.id ? 'Edit Book' : 'Add Book'}
        onClose={closeForm}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="book-form" disabled={saving}>
              {saving && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
              {editing?.id ? 'Save Changes' : 'Add Book'}
            </Button>
          </>
        }
      >
        <form id="book-form" onSubmit={submit} className="space-y-4">
          <TextField
            id="title"
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={errors.title}
            autoFocus
          />
          <SelectField
            id="authorId"
            label="Author"
            required
            value={form.authorId}
            onChange={(e) => setForm({ ...form, authorId: e.target.value })}
            error={errors.authorId}
          >
            <option value="">Select an author…</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </SelectField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              id="category"
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              error={errors.category}
            />
            <NumberField
              id="publishingYear"
              label="Publishing Year"
              value={form.publishingYear}
              onChange={(e) => setForm({ ...form, publishingYear: e.target.value })}
              error={errors.publishingYear}
            />
          </div>
          <TextField
            id="isbn"
            label="ISBN"
            value={form.isbn}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
            error={errors.isbn}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete book"
        message={`Delete "${deleting?.title}"? This cannot be undone. Books with borrow records cannot be deleted.`}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => (deleteBusy ? null : setDeleting(null))}
      />
    </div>
  );
}
