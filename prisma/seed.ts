import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── Seed admin user ──
  const existing = await prisma.user.findUnique({ where: { email: "admin@library.local" } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email: "admin@library.local",
        name: "System Admin",
        hashedPassword: await hash("Admin123!", 12),
        role: "Admin",
      },
    });
    console.log("✅ Admin user created (admin@library.local / Admin123!)");
  }

  // ── Seed books ──
  const count = await prisma.book.count();
  if (count > 0) {
    console.log(`⏭️  ${count} books already exist — skipping seed`);
    return;
  }

  const books = [
    // Software Engineering
    { title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", category: "Software Engineering", tags: "programming,best-practices,clean-code", language: "English", publishYear: 2008, totalCopies: 3, availableCopies: 3, description: "A handbook of agile software craftsmanship." },
    { title: "The Pragmatic Programmer", author: "Andrew Hunt, David Thomas", isbn: "9780135957059", category: "Software Engineering", tags: "programming,career,software-development", language: "English", publishYear: 2019, totalCopies: 2, availableCopies: 2, description: "Your journey to mastery. 20th Anniversary Edition." },
    { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", isbn: "9781449373320", category: "Databases", tags: "distributed-systems,databases,architecture", language: "English", publishYear: 2017, totalCopies: 2, availableCopies: 2, description: "The big ideas behind reliable, scalable, and maintainable systems." },
    { title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbn: "9780262046305", category: "Computer Science", tags: "algorithms,data-structures,textbook", language: "English", publishYear: 2022, totalCopies: 2, availableCopies: 2, description: "The leading textbook on algorithms, fourth edition." },
    // Productivity / Self-Help
    { title: "Atomic Habits", author: "James Clear", isbn: "9780735211292", category: "Productivity", tags: "habits,self-improvement,personal-development", language: "English", publishYear: 2018, totalCopies: 4, availableCopies: 4, description: "An easy & proven way to build good habits & break bad ones." },
    { title: "Deep Work", author: "Cal Newport", isbn: "9781455586691", category: "Productivity", tags: "focus,productivity,career", language: "English", publishYear: 2016, totalCopies: 3, availableCopies: 3, description: "Rules for focused success in a distracted world." },
    { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", isbn: "9781982137274", category: "Self-Help", tags: "habits,leadership,personal-development", language: "English", publishYear: 2020, totalCopies: 3, availableCopies: 3, description: "Powerful lessons in personal change. 30th Anniversary Edition." },
    // Cooking
    { title: "Salt, Fat, Acid, Heat", author: "Samin Nosrat", isbn: "9781476753836", category: "Cooking", tags: "cooking-fundamentals,food-science,beginner-friendly", language: "English", publishYear: 2017, totalCopies: 3, availableCopies: 3, description: "Mastering the elements of good cooking." },
    { title: "The Food Lab", author: "J. Kenji López-Alt", isbn: "9780393081084", category: "Cooking", tags: "food-science,recipes,techniques", language: "English", publishYear: 2015, totalCopies: 2, availableCopies: 2, description: "Better home cooking through science." },
    { title: "Mastering the Art of French Cooking", author: "Julia Child", isbn: "9780375413407", category: "Cooking", tags: "french-cuisine,classic,recipes,techniques", language: "English", publishYear: 2001, totalCopies: 2, availableCopies: 2, description: "The classic French cookbook that has inspired generations." },
    { title: "Ottolenghi Simple", author: "Yotam Ottolenghi", isbn: "9781607749165", category: "Cooking", tags: "mediterranean,vegetarian,quick-meals,recipes", language: "English", publishYear: 2018, totalCopies: 2, availableCopies: 2, description: "130+ recipes for simple, everyday cooking with bold Mediterranean flavors." },
    { title: "The Joy of Cooking", author: "Irma S. Rombauer", isbn: "9781501169717", category: "Cooking", tags: "classic,reference,american-cuisine,baking", language: "English", publishYear: 2019, totalCopies: 3, availableCopies: 3, description: "America's most trusted cookbook for over 85 years." },
    // Fiction
    { title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "9780061120084", category: "Fiction", tags: "classic,american-literature,justice,coming-of-age", language: "English", publishYear: 1960, totalCopies: 4, availableCopies: 4, description: "A gripping, heart-wrenching tale of racial injustice in the Deep South." },
    { title: "1984", author: "George Orwell", isbn: "9780451524935", category: "Fiction", tags: "dystopian,classic,political,science-fiction", language: "English", publishYear: 1949, totalCopies: 3, availableCopies: 3, description: "A dystopian novel set in a totalitarian society ruled by Big Brother." },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "9780743273565", category: "Fiction", tags: "classic,american-literature,jazz-age", language: "English", publishYear: 1925, totalCopies: 3, availableCopies: 3, description: "A portrait of the Jazz Age and the American Dream." },
    { title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", isbn: "9780060883287", category: "Fiction", tags: "magical-realism,latin-american,classic,family-saga", language: "English", publishYear: 1970, totalCopies: 2, availableCopies: 2, description: "The multi-generational story of the Buendía family." },
    // Science
    { title: "A Brief History of Time", author: "Stephen Hawking", isbn: "9780553380163", category: "Science", tags: "physics,cosmology,popular-science", language: "English", publishYear: 1998, totalCopies: 3, availableCopies: 3, description: "From the Big Bang to black holes." },
    { title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", isbn: "9780062316110", category: "Science", tags: "anthropology,history,evolution,popular-science", language: "English", publishYear: 2015, totalCopies: 3, availableCopies: 3, description: "How Homo sapiens came to dominate the planet." },
    // History
    { title: "Guns, Germs, and Steel", author: "Jared Diamond", isbn: "9780393354324", category: "History", tags: "anthropology,civilization,geography,world-history", language: "English", publishYear: 1997, totalCopies: 2, availableCopies: 2, description: "Why certain civilizations rose to power." },
    { title: "The Silk Roads", author: "Peter Frankopan", isbn: "9781101912379", category: "History", tags: "world-history,trade,civilization,asia", language: "English", publishYear: 2015, totalCopies: 2, availableCopies: 2, description: "A new history of the world told through trade networks." },
    // Fantasy
    { title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "9780547928227", category: "Fantasy", tags: "adventure,classic,middle-earth,dragons", language: "English", publishYear: 1937, totalCopies: 3, availableCopies: 3, description: "Bilbo Baggins embarks on an unexpected journey." },
    { title: "The Name of the Wind", author: "Patrick Rothfuss", isbn: "9780756404741", category: "Fantasy", tags: "epic-fantasy,magic,adventure,storytelling", language: "English", publishYear: 2007, totalCopies: 2, availableCopies: 2, description: "The tale of Kvothe." },
    // Psychology / Finance / Health
    { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", isbn: "9780374533557", category: "Psychology", tags: "behavioral-economics,decision-making,cognitive-science", language: "English", publishYear: 2011, totalCopies: 3, availableCopies: 3, description: "The two systems that drive the way we think." },
    { title: "Rich Dad Poor Dad", author: "Robert T. Kiyosaki", isbn: "9781612681139", category: "Finance", tags: "personal-finance,investing,money,financial-literacy", language: "English", publishYear: 2017, totalCopies: 3, availableCopies: 3, description: "What the rich teach their kids about money." },
    { title: "Why We Sleep", author: "Matthew Walker", isbn: "9781501144325", category: "Health", tags: "sleep,neuroscience,wellness,popular-science", language: "English", publishYear: 2017, totalCopies: 2, availableCopies: 2, description: "Unlocking the power of sleep and dreams." },
    // Non-English
    { title: "Le Petit Prince", author: "Antoine de Saint-Exupéry", isbn: "9782070612758", category: "Fiction", tags: "classic,french-literature,philosophical,children", language: "French", publishYear: 1943, totalCopies: 2, availableCopies: 2, description: "Un conte poétique et philosophique." },
  ];

  await prisma.book.createMany({ data: books });
  console.log(`✅ Seeded ${books.length} books`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
