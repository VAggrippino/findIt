require('dotenv').config()
const express = require('express')

const port = process.env.PORT || 3000

const app = express()
app.set('view engine', 'pug')
app.use(express.static('public')) // For CSS & client-side JavaScript

app.get('/', (req, res) => {
  res.render('index')
})

app.listen(port, () => {
  console.log(`Listening on port ${port} ...`)
})
