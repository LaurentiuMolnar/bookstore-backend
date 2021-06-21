import { DynamoDBClient, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb'
import { PersistedBook } from '../entities/Book'

export type BooksDb = {
  createBook: (bookData: PersistedBook) => Promise<any>
}

export function buildBooksDb(client: DynamoDBClient): BooksDb {
  return {
    createBook
  }
  
  async function createBook(bookData: PersistedBook): Promise<any> {
    const command = new BatchWriteItemCommand({
      RequestItems: {
        [process.env.TABLE_NAME!]: bookData.map((b) => ({
          PutRequest: {
            Item: b,
          }
        }))
      }
    })

    const result = await client.send(command)
    return result
  }
}