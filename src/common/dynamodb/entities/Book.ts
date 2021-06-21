import { createAuthorIdentifier, createBookIdentifier } from "..";
import { Author } from "./Author";

export type Book = {
  bookId: string
  title: string
  authors: Author[]
  isbn: string
  genre: string
}

export type PersistedBook = {
  PK: { S: string }
  SK: { S: string }
  title: { S: string }
  isbn: { S: string }
  genre: { S: string }
  authorName: { S: string }
  entityType: { S: 'book' }
}[]

export function toPersistence(book: Book): PersistedBook {
  return book.authors.map((a) => {
    return {
      PK: { S: createBookIdentifier(book.bookId) },
      SK: { S: createAuthorIdentifier(a.authorId) },
      genre: { S: book.genre },
      authorName: { S: a.name },
      isbn: { S: book.isbn },
      title: { S: book.title },
      entityType: { S: 'book' },
    }
  })
}