import api from './client.js';

/** Build a CRUD client bound to a REST resource path. */
function createResource(path) {
  return {
    list: (params) => api.get(path, { params }).then((r) => r.data),
    all: () => api.get(`${path}/all`).then((r) => r.data),
    get: (id) => api.get(`${path}/${id}`).then((r) => r.data),
    create: (body) => api.post(path, body).then((r) => r.data),
    update: (id, body) => api.put(`${path}/${id}`, body).then((r) => r.data),
    remove: (id) => api.delete(`${path}/${id}`).then((r) => r.data),
  };
}

export const authorsApi = createResource('/authors');
export const booksApi = createResource('/books');
export const membersApi = createResource('/members');
export const borrowedBooksApi = createResource('/borrowed-books');

// Members carry an extra endpoint for their borrowed books.
membersApi.borrowedBooks = (id) =>
  api.get(`/members/${id}/borrowed-books`).then((r) => r.data);
