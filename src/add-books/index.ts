import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'
import Joi from 'joi'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { adaptEvent } from '@common/adapters/lambda'
import { generateId } from '@common/utils/id'
import { buildBooksDb } from '@common/dynamodb/builders/books'
import { toPersistence } from '@common/dynamodb/entities/Book'

type AuthorDto = {
  name: string
}

type AddBookDto = {
  title: string
  authors: AuthorDto[]
  isbn: string
  genre: string
}

export async function handler(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
  const { body } = adaptEvent(event)
  const bookData = body as AddBookDto

  const validationSchema = Joi.object<AddBookDto>({
    title: Joi.string().min(3).max(100).required(),
    authors: Joi.array().min(1).max(5).required().items(
      Joi.object<AuthorDto>({
        name: Joi.string().min(3).max(50).required(),
      })
    ),
    genre: Joi.string().min(3).max(20).required(),
    isbn: Joi.string().required(),
  })

  const client = new DynamoDBClient({ region: process.env?.AWS_REGION ?? 'eu-central-1' })

  try {
    await validationSchema.validateAsync(body, { abortEarly: true })

    const booksDb = buildBooksDb(client)
    const book = {
      bookId: generateId(),
      genre: bookData.genre,
      isbn: bookData.isbn,
      title: bookData.title,
      authors: bookData.authors.map((a) => ({ authorId: generateId(), name: a.name }))
    }
    const response = await booksDb.createBook(toPersistence(book))

    console.log(response)

    return {
      statusCode: 201,
      body: JSON.stringify(book),
    }
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      return {
        statusCode: 400,
        body: JSON.stringify(error),
      }
    }
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    }
  }
}