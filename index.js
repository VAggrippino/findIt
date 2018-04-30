'use strict'
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
  let poweredBy
  let results
  switch (req.query.searchType) {
    case 'web':
      poweredBy = 'Google Custom Search'
      results = await cseSearch(req)
      break
    case 'images':
      poweredBy = 'Bing Web Search API'
      results = await bingImageSearch(req)
      break
    case 'books':
      poweredBy = 'Amazon'
      break
    case 'Movies':
      poweredBy = 'Open Movie Database'
      break
    case 'Products':
      poweredBy = 'Amazon'
      break
  }

  let data = {
    searchType: req.query.searchType,
    poweredBy: poweredBy,
    query: req.query.query,
    page: +req.query.page || 1,
    results: results
  }
  res.render('results', data)
}

function cseSearch (req) {
  let searchType = req.query.searchType
  let cseId = process.env['CSE_ID_' + searchType.toUpperCase()]
  let start = req.query.page ? (req.query.page * 10) - 10 : 1
  if (start < 1) start = 1

  let options = {
    uri: 'https://www.googleapis.com/customsearch/v1/',
    qs: {
      q: encodeURIComponent(req.query.query),
      cx: cseId,
      key: process.env.CSE_API_KEY,
      num: 10,
      safe: 'high',
      start: start
    },
    json: true
  }

  return rp(options)
    .then(results => {
      let pages = Math.floor(results.searchInformation.totalResults / 10) + 1
      let data = {
        searchType: req.query.searchType,
        searchTime: results.searchInformation.formattedSearchTime,
        resultCount: results.searchInformation.formattedTotalResults,
        items: results.items,
        pages: pages
      }
      return data
    })
    .catch(error => {
      console.log(error)
      return error
    })
}

function bingImageSearch (req) {
  let host = 'api.cognitive.microsoft.com'
  let path = '/bing/v7.0/images/search'

  let options = {
    uri: 'https://' + host + path,
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY
    },
    qs: {
      q: req.query.query,
      count: 25
    }
  }

  return rp(options)
    .then(results => {
      let obj = JSON.parse(results)
      console.log(JSON.stringify(obj.value, null, 2))

      let data = {
        searchType: req.query.searchType,
        resultCount: obj.value.length,
        items: obj.value
      }

      return data
    })
    .catch(error => {
      console.log('-----')
      console.log('Request Failed:')

      Object.entries(JSON.parse(error.error)).map(part => {
        console.log(part[0], part[1])
      })

      console.log('=====')
    })
}
