import { useEffect, useMemo, useState } from 'react';
import { borrowedBooksApi, booksApi, membersApi } from '../api/resources.js';
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
import { DateField, SelectField } from '../components/Field.jsx';
import { PlusIcon } from '../components/Icons.jsx';
import { formatDate, statusMeta, BORROW_STATUSES } from '../utils/format.js';

const PAGE_SIZE = 10;
const emptyForm = {
  bookId: '',
  memberId: '',
  borrowDate: '',
  dueDate: '',
  returnDate: '',
  status: 'BORROWED',
};

export default function BorrowedBooksPage() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput);
  const [borrowDate, setBorrowDate] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const { options: books, loading: booksLoading } = useOptions(booksApi.all);
  const { options: members, loading: membersLoading } = useOptions(membersApi.all);

  useEffect(() => setPage(0), [search, borrowDate]);

  const params = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      search: search || undefined,
      borrowDate: borrowDate || undefined,
    }),
    [page, search, borrowDate],
  );
  const { data, loading, error } = usePagedData(borrowedBooksApi.list, params, refreshKey);

  const refresh = () => setRefreshKey((k) => k + 1);

  const openCreate = () => {
    setEditing({});
    setForm(emptyForm);
    setErrors({});
  };

  const openEdit = (record) => {
    setEditing(record);
    setForm({
      bookId: record.book?.id ?? '',
      memberId: record.member?.id ?? '',
      borrowDate: record.borrowDate ?? '',
      dueDate: record.dueDate ?? '',
      returnDate: record.returnDate ?? '',
      status: record.status ?? 'BORROWED',
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
      bookId: form.bookId ? Number(form.bookId) : null,
      memberId: form.memberId ? Number(form.memberId) : null,
      borrowDate: form.borrowDate || null,
      dueDate: form.dueDate || null,
      returnDate: form.returnDate || null,
      status: form.status,
    };
    try {
      if (editing.id) {
        await borrowedBooksApi.update(editing.id, payload);
        toast.success('Borrow record updated');
      } else {
        await borrowedBooksApi.create(payload);
        toast.success('Borrow record added');
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
      await borrowedBooksApi.remove(deleting.id);
      toast.success('Borrow record deleted');
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
      key: 'book',
      header: 'Book',
      render: (r) => <span className="font-medium text-slate-800">{r.book?.title}</span>,
    },
    { key: 'member', header: 'Member', render: (r) => r.member?.name },
    { key: 'borrowDate', header: 'Borrowed', render: (r) => formatDate(r.borrowDate) },
    { key: 'dueDate', header: 'Due', render: (r) => formatDate(r.dueDate) },
    { key: 'returnDate', header: 'Returned', render: (r) => formatDate(r.returnDate) },
    {
      key: 'status',
      header: 'Status',
      render: (r) => {
        const meta = statusMeta(r.status);
        return <Badge tone={meta.tone}>{meta.label}</Badge>;
      },
    },
  ];

  const optionsLoading = booksLoading || membersLoading;
  const canAdd = !optionsLoading && books.length > 0 && members.length > 0;

  return (
    <div>
      <Toolbar description="Track borrowed books. Search by book title or member name, and filter by borrow date.">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by book or member…"
          className="sm:w-72"
        />
        <input
          type="date"
          value={borrowDate}
          onChange={(e) => setBorrowDate(e.target.value)}
          aria-label="Filter by borrow date"
          className="rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-500"
        />
        {borrowDate && (
          <Button variant="secondary" onClick={() => setBorrowDate('')}>
            Clear date
          </Button>
        )}
        <Button onClick={openCreate} disabled={!canAdd} title={!canAdd ? 'Add a book and a member first' : undefined}>
          <PlusIcon /> Add Record
        </Button>
      </Toolbar>

      {!optionsLoading && !canAdd && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You need at least one book and one member before adding a borrow record.
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
            title: 'No borrow records found',
            description:
              search || borrowDate
                ? 'Try adjusting your search or date filter.'
                : 'Add your first borrow record to get started.',
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
        title={editing?.id ? 'Edit Borrow Record' : 'Add Borrow Record'}
        onClose={closeForm}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="borrow-form" disabled={saving}>
              {saving && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
              {editing?.id ? 'Save Changes' : 'Add Record'}
            </Button>
          </>
        }
      >
        <form id="borrow-form" onSubmit={submit} className="space-y-4">
          <SelectField
            id="bookId"
            label="Book"
            required
            value={form.bookId}
            onChange={(e) => setForm({ ...form, bookId: e.target.value })}
            error={errors.bookId}
          >
            <option value="">Select a book…</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </SelectField>
          <SelectField
            id="memberId"
            label="Member"
            required
            value={form.memberId}
            onChange={(e) => setForm({ ...form, memberId: e.target.value })}
            error={errors.memberId}
          >
            <option value="">Select a member…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </SelectField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DateField
              id="borrowDate"
              label="Borrow Date"
              required
              value={form.borrowDate}
              onChange={(e) => setForm({ ...form, borrowDate: e.target.value })}
              error={errors.borrowDate}
            />
            <DateField
              id="dueDate"
              label="Due Date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              error={errors.dueDate}
            />
            <DateField
              id="returnDate"
              label="Return Date"
              value={form.returnDate}
              onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
              error={errors.returnDate}
            />
            <SelectField
              id="status"
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              error={errors.status}
            >
              {BORROW_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusMeta(s).label}
                </option>
              ))}
            </SelectField>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete borrow record"
        message={`Delete the record for "${deleting?.book?.title}" borrowed by ${deleting?.member?.name}? This cannot be undone.`}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => (deleteBusy ? null : setDeleting(null))}
      />
    </div>
  );
}
