const express = require('express')
const { getTodos, createTodo, updateTodo } = require('./db')
const app = express()

const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

app.use(awsServerlessExpressMiddleware.eventContext())

app.get('/todos', async (req, res) => {
  const todos = await getTodos()
  res.json(todos)
})

app.use('*', (req, res) => {
  res.json(req.apiGateway.event)
})
module.exports = app
