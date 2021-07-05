const { handleTodos } = require('./todos')

exports.handler = async (event, context) => {
  const { http } = event.requestContext

  switch (http.path) {
    case '/':
      return { statusCode: 200, body: JSON.stringify(event) }
    case '/todos':
      return handleTodos(event)
    default:
      return null
  }
}
