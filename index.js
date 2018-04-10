require('dotenv').config()
const express = require('express')
const rp = require('request-promise-native')

const port = process.env.PORT || 3000

const app = express()
app.set('view engine', 'pug')
app.use(express.static('public')) // For CSS & client-side JavaScript

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/search', newQuery)

app.listen(port, () => {
  console.log(`Listening on port ${port} ...`)
})

async function newQuery (req, res) {
  let data = {
    searchType: req.query.searchType,
    query: req.query.query,
    page: +req.query.page || 1,
    results: await cseSearch(req)
  }
  res.render('search', data)
}

function cseSearch (req) {
  let searchType = req.query.searchType
  let cseId = process.env['CSE_ID_' + searchType.toUpperCase()]
  let start = req.query.page ? (req.query.page * 10) - 10 : 1
  if (start < 1) start = 1

  let options = {
    uri: 'https://www.googleapis.com/customsearch/v1/',
    qs: {
      q: req.query.query,
      cx: cseId,
      key: process.env.API_KEY,
      num: 10,
      safe: 'high',
      start: start
    },
    json: true
  }

  return rp(options)
    .then(results => {
      console.log(results.searchInformation)
      console.log(results)
      let pages = Math.floor(results.searchInformation.totalResults / 10) + 1
      let data = {
        searchType: req.query.searchType,
        searchTime: results.searchInformation.formattedSearchTime,
        resultCount: results.searchInformation.formattedTotalResults,
        items: results.items,
        pages: pages
      }
      console.log(`pages: ${pages}`)
      return data
    })
    .catch(error => {
      console.log(error)
      return error
    })
}
