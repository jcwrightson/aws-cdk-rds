const client = require('data-api-client')
const uuid = require('uuid')

const connection = client({
  secretArn: process.env.SECRET_ARN,
  resourceArn: process.env.CLUSTER_ARN,
  database: process.env.DB_NAME,
})

const getTodos = async () => {
  console.log('FETCH Todos')
  const query = 'SELECT * FROM todo'
  const result = await connection.query(query)
  console.log(result.records)
  return result.records
}

const createTodo = async (task) => {
  console.log('CREATE todo')
  const todo = {
    id: uuid.v4(),
    task,
  }
  const query = `INSERT INTO todo (id, task) VALUES(:id,:task)`
  await connection.query(query, todo)
  return todo
}

const updateTodo = async (id) => {
  console.log('UPDATE todo')
  const query = 'UPDATE todo SET complete = true WHERE id = :id'
  await connection.query(query, { id })
  return { id }
}

module.exports = {
  connection,
  getTodos,
  createTodo,
  updateTodo,
}
