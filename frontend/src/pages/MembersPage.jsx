import { useEffect, useMemo, useState } from 'react';
import { membersApi } from '../api/resources.js';
import { extractError, extractFieldErrors } from '../api/client.js';
import { usePagedData } from '../hooks/usePagedData.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useToast } from '../components/Toast.jsx';
import { Card, Toolbar } from '../components/page.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { SearchBar } from '../components/SearchBar.jsx';
import { Modal } from '../components/Modal.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { Button, Badge, Spinner, EmptyState } from '../components/primitives.jsx';
import { TextField, DateField, TextArea } from '../components/Field.jsx';
import { PlusIcon } from '../components/Icons.jsx';
import { formatDate, statusMeta } from '../utils/format.js';

const PAGE_SIZE = 10;
const emptyForm = { name: '', email: '', phone: '', address: '', membershipDate: '' };

export default function MembersPage() {
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

  // Borrowed-books detail view
  const [viewing, setViewing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => setPage(0), [search]);

  const params = useMemo(
    () => ({ page, size: PAGE_SIZE, search: search || undefined }),
    [page, search],
  );
  const { data, loading, error } = usePagedData(membersApi.list, params, refreshKey);

  const refresh = () => setRefreshKey((k) => k + 1);

  const openCreate = () => {
    setEditing({});
    setForm(emptyForm);
    setErrors({});
  };

  const openEdit = (member) => {
    setEditing(member);
    setForm({
      name: member.name ?? '',
      email: member.email ?? '',
      phone: member.phone ?? '',
      address: member.address ?? '',
      membershipDate: member.membershipDate ?? '',
    });
    setErrors({});
  };

  const closeForm = () => {
    if (!saving) setEditing(null);
  };

  const openView = async (member) => {
    setViewing(member);
    setDetail(null);
    setDetailLoading(true);
    try {
      setDetail(await membersApi.borrowedBooks(member.id));
    } catch (err) {
      toast.error(extractError(err));
      setViewing(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      membershipDate: form.membershipDate || null,
    };
    try {
      if (editing.id) {
        await membersApi.update(editing.id, payload);
        toast.success('Member updated');
      } else {
        await membersApi.create(payload);
        toast.success('Member added');
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
      await membersApi.remove(deleting.id);
      toast.success('Member deleted');
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
      key: 'name',
      header: 'Name',
      render: (m) => <span className="font-medium text-slate-800">{m.name}</span>,
    },
    { key: 'email', header: 'Email', render: (m) => <span className="text-slate-500">{m.email}</span> },
    { key: 'phone', header: 'Phone', render: (m) => m.phone || '—' },
    { key: 'membershipDate', header: 'Member Since', render: (m) => formatDate(m.membershipDate) },
    {
      key: 'borrowedCount',
      header: 'Borrowed',
      render: (m) => (
        <button
          onClick={() => openView(m)}
          className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
        >
          {m.borrowedCount} {m.borrowedCount === 1 ? 'book' : 'books'}
        </button>
      ),
    },
  ];

  return (
    <div>
      <Toolbar description="Manage library members and view their borrowed books.">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by name or email…"
          className="sm:w-72"
        />
        <Button onClick={openCreate}>
          <PlusIcon /> Add Member
        </Button>
      </Toolbar>

      <Card>
        <DataTable
          columns={columns}
          rows={data.content}
          loading={loading}
          error={error}
          onEdit={openEdit}
          onDelete={setDeleting}
          empty={{
            title: 'No members found',
            description: search ? 'Try a different search term.' : 'Add your first member to get started.',
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

      {/* Create / Edit */}
      <Modal
        open={editing !== null}
        title={editing?.id ? 'Edit Member' : 'Add Member'}
        onClose={closeForm}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="member-form" disabled={saving}>
              {saving && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
              {editing?.id ? 'Save Changes' : 'Add Member'}
            </Button>
          </>
        }
      >
        <form id="member-form" onSubmit={submit} className="space-y-4">
          <TextField
            id="name"
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            autoFocus
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              id="email"
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
            <TextField
              id="phone"
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={errors.phone}
            />
          </div>
          <TextArea
            id="address"
            label="Address"
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            error={errors.address}
          />
          <DateField
            id="membershipDate"
            label="Membership Date"
            value={form.membershipDate}
            onChange={(e) => setForm({ ...form, membershipDate: e.target.value })}
            error={errors.membershipDate}
          />
        </form>
      </Modal>

      {/* Borrowed books detail */}
      <Modal
        open={viewing !== null}
        title={viewing ? `${viewing.name} · Borrowed Books` : 'Borrowed Books'}
        onClose={() => setViewing(null)}
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setViewing(null)}>
            Close
          </Button>
        }
      >
        {detailLoading && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}
        {!detailLoading && detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <p><span className="text-slate-500">Email:</span> {detail.email}</p>
              <p><span className="text-slate-500">Phone:</span> {detail.phone || '—'}</p>
              <p className="sm:col-span-2"><span className="text-slate-500">Address:</span> {detail.address || '—'}</p>
              <p><span className="text-slate-500">Member since:</span> {formatDate(detail.membershipDate)}</p>
            </div>

            {detail.borrowedBooks.length === 0 ? (
              <EmptyState title="No borrowed books" description="This member hasn't borrowed anything yet." />
            ) : (
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {detail.borrowedBooks.map((b) => {
                  const meta = statusMeta(b.status);
                  return (
                    <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-800">{b.book?.title}</p>
                        <p className="text-xs text-slate-500">
                          Borrowed {formatDate(b.borrowDate)} · Due {formatDate(b.dueDate)}
                          {b.returnDate ? ` · Returned ${formatDate(b.returnDate)}` : ''}
                        </p>
                      </div>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete member"
        message={`Delete "${deleting?.name}"? This cannot be undone. Members with borrow records cannot be deleted.`}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => (deleteBusy ? null : setDeleting(null))}
      />
    </div>
  );
}
