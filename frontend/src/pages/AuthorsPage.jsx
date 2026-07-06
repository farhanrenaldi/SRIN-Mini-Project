import { useEffect, useMemo, useState } from 'react';
import { authorsApi } from '../api/resources.js';
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
import { Button, Badge, Spinner } from '../components/primitives.jsx';
import { TextField, NumberField, TextArea } from '../components/Field.jsx';
import { PlusIcon } from '../components/Icons.jsx';

const PAGE_SIZE = 10;
const emptyForm = { name: '', nationality: '', birthYear: '', bio: '' };

export default function AuthorsPage() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput);
  const [refreshKey, setRefreshKey] = useState(0);

  const [editing, setEditing] = useState(null); // author object, {} for new, or null
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => setPage(0), [search]);

  const params = useMemo(
    () => ({ page, size: PAGE_SIZE, search: search || undefined }),
    [page, search],
  );
  const { data, loading, error } = usePagedData(authorsApi.list, params, refreshKey);

  const refresh = () => setRefreshKey((k) => k + 1);

  const openCreate = () => {
    setEditing({});
    setForm(emptyForm);
    setErrors({});
  };

  const openEdit = (author) => {
    setEditing(author);
    setForm({
      name: author.name ?? '',
      nationality: author.nationality ?? '',
      birthYear: author.birthYear ?? '',
      bio: author.bio ?? '',
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
      name: form.name.trim(),
      nationality: form.nationality.trim() || null,
      birthYear: form.birthYear === '' ? null : Number(form.birthYear),
      bio: form.bio.trim() || null,
    };
    try {
      if (editing.id) {
        await authorsApi.update(editing.id, payload);
        toast.success('Author updated');
      } else {
        await authorsApi.create(payload);
        toast.success('Author added');
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
      await authorsApi.remove(deleting.id);
      toast.success('Author deleted');
      setDeleting(null);
      // Step back a page if we just removed the last row on it.
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
      render: (a) => <span className="font-medium text-slate-800">{a.name}</span>,
    },
    { key: 'nationality', header: 'Nationality', render: (a) => a.nationality || '—' },
    { key: 'birthYear', header: 'Born', render: (a) => a.birthYear || '—' },
    {
      key: 'bookCount',
      header: 'Books',
      render: (a) => <Badge tone="indigo">{a.bookCount}</Badge>,
    },
    {
      key: 'bio',
      header: 'Bio',
      className: 'max-w-xs',
      render: (a) => (
        <span className="line-clamp-2 text-slate-500">{a.bio || '—'}</span>
      ),
    },
  ];

  return (
    <div>
      <Toolbar description="Manage the authors in your catalog.">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by name or nationality…"
          className="sm:w-72"
        />
        <Button onClick={openCreate}>
          <PlusIcon /> Add Author
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
            title: 'No authors found',
            description: search ? 'Try a different search term.' : 'Add your first author to get started.',
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
        title={editing?.id ? 'Edit Author' : 'Add Author'}
        onClose={closeForm}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="author-form" disabled={saving}>
              {saving && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
              {editing?.id ? 'Save Changes' : 'Add Author'}
            </Button>
          </>
        }
      >
        <form id="author-form" onSubmit={submit} className="space-y-4">
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
              id="nationality"
              label="Nationality"
              value={form.nationality}
              onChange={(e) => setForm({ ...form, nationality: e.target.value })}
              error={errors.nationality}
            />
            <NumberField
              id="birthYear"
              label="Birth Year"
              value={form.birthYear}
              onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
              error={errors.birthYear}
            />
          </div>
          <TextArea
            id="bio"
            label="Bio"
            rows={4}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            error={errors.bio}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete author"
        message={`Delete "${deleting?.name}"? This cannot be undone. Authors with assigned books cannot be deleted.`}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => (deleteBusy ? null : setDeleting(null))}
      />
    </div>
  );
}
