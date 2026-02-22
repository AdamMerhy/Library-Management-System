import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "Admin" && role !== "Librarian") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();

  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  if (!title || !author) {
    return NextResponse.json(
      { error: "Title and author are required" },
      { status: 400 }
    );
  }

  let coverImageUrl = (formData.get("coverImageUrl") as string) || null;

  // Handle file upload
  const coverImage = formData.get("coverImage") as File | null;
  if (coverImage && coverImage.size > 0) {
    if (coverImage.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be under 5MB" },
        { status: 400 }
      );
    }
    const ext = path.extname(coverImage.name);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const bytes = await coverImage.arrayBuffer();
    await writeFile(path.join(uploadsDir, filename), Buffer.from(bytes));
    coverImageUrl = `/uploads/${filename}`;
  }

  const publishYear = formData.get("publishYear")
    ? parseInt(formData.get("publishYear") as string)
    : null;

  const book = await prisma.book.create({
    data: {
      title,
      author,
      isbn: (formData.get("isbn") as string) || null,
      category: (formData.get("category") as string) || null,
      tags: (formData.get("tags") as string) || null,
      description: (formData.get("description") as string) || null,
      publishYear,
      language: (formData.get("language") as string) || null,
      locationShelf: (formData.get("locationShelf") as string) || null,
      coverImageUrl,
      totalCopies: parseInt(formData.get("totalCopies") as string) || 1,
      availableCopies:
        parseInt(formData.get("availableCopies") as string) || 1,
    },
  });

  return NextResponse.json({ id: book.id });
}
