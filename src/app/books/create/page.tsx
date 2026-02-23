import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BookForm from "@/components/BookForm";

export default async function CreateBookPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "Admin" && role !== "Librarian") redirect("/books");

  return <BookForm mode="create" />;
}
