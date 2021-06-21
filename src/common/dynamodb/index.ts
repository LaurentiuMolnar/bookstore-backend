export const bookPrefix = 'BOOK'
export const authorPrefix = 'AUTHOR'
export const storePrefix = 'STORE'

export function createBookIdentifier(bookId: string): string {
  return `${bookPrefix}#${bookId}`
}

export function createAuthorIdentifier(authorId: string): string {
  return `${authorPrefix}#${authorId}`
}