import Book from "../models/book.model";

export default async function create(req, res) {
  try {
    const { title, author, summary, publisher } = req.body;

    const book = await Book.create({
      title,
      author,
      summary,
      publisher,
    });

    return res.status(201).json({
      status: 201,
      success: true,
      message: "new book created",
      data: {
        book: book,
      },
      error: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "internal server error",
      data: null,
      error: "Internal Server Error",
    });
  }
}