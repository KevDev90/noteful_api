require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const notesRouter = require('./notes/notes-router')
const foldersRouter = require('./folders/folders-router')
const bodyParser = require('body-parser')
const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use((req, res, next) => {
  next()
})

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN
  const authToken = req.header('Authorization')

  if (!authToken || authToken.split(" ")[1] != apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  next()
})

app.use('/api/folders', foldersRouter)
app.use('/api/notes', notesRouter)
app.get('/', (req, res) => {
  res.send('Hello, world!')
})


app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})


module.exports = app