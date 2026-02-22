"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";

interface Props {
  initialData?: {
    id?: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
    tags: string;
    description: string;
    publishYear: number | null;
    language: string;
    locationShelf: string;
    coverImageUrl: string;
    totalCopies: number;
    availableCopies: number;
  };
  mode: "create" | "edit";
}

export default function BookForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverPreview, setCoverPreview] = useState(initialData?.coverImageUrl ?? "");

  function handleFilePreview(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const url =
        mode === "create" ? "/api/books" : `/api/books/${initialData?.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/books/${data.id}`);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to save book");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-page">
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
        {mode === "create" ? "Add Book" : "Edit Book"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="card">
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div className="md:col-span-2">
                    <label className="form-label">Title *</label>
                    <input
                      name="title"
                      defaultValue={initialData?.title}
                      className="form-control"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">ISBN</label>
                    <input
                      name="isbn"
                      defaultValue={initialData?.isbn}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Author *</label>
                  <input
                    name="author"
                    defaultValue={initialData?.author}
                    className="form-control"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="form-label">Category</label>
                    <input
                      name="category"
                      defaultValue={initialData?.category}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label">Language</label>
                    <input
                      name="language"
                      defaultValue={initialData?.language}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label">Publish Year</label>
                    <input
                      name="publishYear"
                      type="number"
                      defaultValue={initialData?.publishYear ?? ""}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Cover Image</label>
                  <input
                    name="coverImage"
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    className="form-control"
                    onChange={handleFilePreview}
                  />
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Preview"
                      className="cover-preview"
                    />
                  )}
                  <small className="text-[var(--text-muted)] block mt-1">
                    Max 5 MB · .jpg, .png, .gif, .webp
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Or paste a URL</label>
                  <input
                    name="coverImageUrl"
                    defaultValue={initialData?.coverImageUrl}
                    className="form-control"
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Tags</label>
                  <input
                    name="tags"
                    defaultValue={initialData?.tags}
                    className="form-control"
                    placeholder="comma-separated, e.g. fiction, history"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    defaultValue={initialData?.description}
                    className="form-control"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="form-label">Shelf Location</label>
                    <input
                      name="locationShelf"
                      defaultValue={initialData?.locationShelf}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label">Total Copies *</label>
                    <input
                      name="totalCopies"
                      type="number"
                      min="1"
                      defaultValue={initialData?.totalCopies ?? 1}
                      className="form-control"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Available Copies *</label>
                    <input
                      name="availableCopies"
                      type="number"
                      min="0"
                      defaultValue={initialData?.availableCopies ?? 1}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading
                      ? "Saving…"
                      : mode === "create"
                        ? "Add Book"
                        : "Save Changes"}
                  </button>
                  <Link href="/books" className="btn btn-secondary">
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
