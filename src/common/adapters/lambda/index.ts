import { APIGatewayEvent } from 'aws-lambda'

type Request = {
  headers: Record<string, string[] | undefined>
  body: any
  queryStringParameters: Record<string, string[] | undefined> | null
  pathParameters: Record<string, string | undefined> | null
}

export function adaptEvent(event: APIGatewayEvent): Request {
  const { multiValueHeaders, multiValueQueryStringParameters, body, pathParameters } = event

  return {
    body: body ? JSON.parse(body) : null,
    headers: multiValueHeaders,
    pathParameters,
    queryStringParameters: multiValueQueryStringParameters,
  }
}