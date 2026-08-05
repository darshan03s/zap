import { ApiError } from './errors'

export function withErrorHandler<T extends unknown[]>(handler: (...args: T) => Promise<Response>) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (error) {
      if (error instanceof ApiError) {
        return Response.json(
          {
            error: {
              code: error.code,
              message: error.message
            }
          },
          {
            status: error.code
          }
        )
      }

      console.error(error)

      return Response.json(
        {
          error: {
            code: 500,
            message: 'Internal server error'
          }
        },
        {
          status: 500
        }
      )
    }
  }
}
