const { getTodos, createTodo, updateTodo } = require('./db')

exports.handler = async (event) => {
  const { http } = event.requestContext
  let body

  switch (http.method) {
    case 'GET':
      const todos = await getTodos()
      return JSON.stringify(todos)
    case 'POST':
      body = JSON.parse(event.body)
      const todo = await createTodo(body.todo)
      return JSON.stringify(todo)
    case 'PUT':
      body = JSON.parse(event.body)
      const updated = await updateTodo(body.id)
      return JSON.stringify(updated)
    default:
      return null
  }
}
