const express = require('express')
const app = express()
const { getCurrentInvoke } = require('@vendia/serverless-express')
const { getTodos, createTodo, updateTodo } = require('./db')


app.get('/todos', async (req, res) => {
  const todos = await getTodos()
  res.json(todos)
})

app.post('/todos', async (req, res) => {
  const { event } = getCurrentInvoke()
  const body = JSON.parse(event.body)
  const todo = await createTodo(body.todo)
  res.json(todo)
})

app.put('/todos', async (req, res) => {
  const { event } = getCurrentInvoke()
  const body = JSON.parse(event.body)
  const updated = await updateTodo(body.id)
  res.json(updated)
})

app.use('*', (req, res) => {
  res.sendStatus(418)
})

module.exports = app
