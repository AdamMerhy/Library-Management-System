/* ===== Database row types (mirror Prisma models) ===== */

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string | null;
  category: string | null;
  tags: string | null;
  description: string | null;
  publishYear: number | null;
  language: string | null;
  locationShelf: string | null;
  coverImageUrl: string | null;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Loan {
  id: number;
  bookId: number;
  borrowedByUserId: string;
  borrowedAt: Date;
  dueAt: Date;
  returnedAt: Date | null;
  status: "Borrowed" | "Returned";
  book?: Book;
  borrowedBy?: User;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

/* ===== AI Search ===== */

export interface AiSearchFilters {
  keywords?: string[] | null;
  title?: string | null;
  author?: string | null;
  isbn?: string | null;
  category?: string | null;
  tags?: string[] | null;
  language?: string | null;
  publishYearMin?: number | null;
  publishYearMax?: number | null;
  availableOnly?: boolean | null;
  sortBy?: string | null;
  limit?: number;
}

export interface AiSearchResult {
  filters: AiSearchFilters;
  explanation: string;
  usedFallback: boolean;
}

/* ===== View Models ===== */

export interface BookListParams {
  searchTerm?: string;
  category?: string;
  availableOnly?: boolean;
  publishYearMin?: number;
  publishYearMax?: number;
  page?: number;
  pageSize?: number;
}

export interface BookFormData {
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  tags?: string;
  description?: string;
  publishYear?: number;
  language?: string;
  locationShelf?: string;
  coverImageUrl?: string;
  totalCopies: number;
  availableCopies: number;
}

export interface UserRoleData {
  userId: string;
  email: string;
  fullName: string | null;
  roles: string[];
  selectedRole: string;
}
