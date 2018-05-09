require('dotenv').config();
const express = require('express');
const rp = require('request-promise-native');

const port = process.env.PORT || 3000;

const app = express();
app.set('view engine', 'pug');
app.use(express.static('public')); // For CSS & client-side JavaScript

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/search', newQuery);

app.listen(port, () => {
  console.log(`Listening on port ${port} ...`);
});

async function newQuery(req, res) {
  let poweredBy;
  let results;
  switch (req.query.searchType) {
    case 'web':
      poweredBy = 'Google Custom Search';
      results = await cseSearch(req);
      break;
    case 'images':
      poweredBy = 'Bing Web Search API';
      results = await bingImageSearch(req);
      break;
    case 'books':
      poweredBy = 'Amazon';
      break;
    case 'Movies':
      poweredBy = 'Open Movie Database';
      break;
    case 'Products':
      poweredBy = 'Amazon';
      break;
    default:
      break;
  }

  const data = {
    searchType: req.query.searchType,
    poweredBy,
    query: req.query.query,
    page: +req.query.page || 1,
    results,
  };
  res.render('results', data);
}

function cseSearch(req) {
  const { searchType } = req.query;
  const cseId = process.env[`CSE_ID_${searchType.toUpperCase()}`];

  const resultCount = 10;
  let start = req.query.page ? (req.query.page * resultCount) - resultCount : 1;
  if (start < 1) start = 1;

  const options = {
    uri: 'https://www.googleapis.com/customsearch/v1/',
    qs: {
      q: encodeURIComponent(req.query.query),
      cx: cseId,
      key: process.env.CSE_API_KEY,
      num: resultCount,
      safe: 'high',
      start,
    },
    json: true,
  };

  return rp(options)
    .then((results) => {
      const pages = Math.floor(results.searchInformation.totalResults / resultCount) + 1;
      const data = {
        searchType: req.query.searchType,
        searchTime: results.searchInformation.formattedSearchTime,
        resultCount: results.searchInformation.formattedTotalResults,
        items: results.items,
        pages,
      };
      return data;
    })
    .catch((error) => {
      console.error(error);
      return error;
    });
}

function bingImageSearch(req) {
  const host = 'api.cognitive.microsoft.com';
  const path = '/bing/v7.0/images/search';
  const resultCount = 1;

  const options = {
    resolveWithFullResponse: false,
    uri: `https://${host}${path}`,
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY,
    },
    qs: {
      q: req.query.query,
      count: resultCount,
    },
  };

  return rp(options)
    .then((results) => {
      let obj;
      if (options.resolveWithFullResponse) {
        obj = JSON.parse(results.body);
      } else {
        obj = JSON.parse(results);
      }

      const data = {
        searchType: req.query.searchType,
        resultCount: obj.value.length,
        items: obj.value,
        pages: Math.floor(obj.totalEstimatedMatches / resultCount) + 1,
      };

      return data;
    })
    .catch((error) => {
      console.error('-----');
      console.error('Request Failed:');
      console.error(error);
      console.error('+++++');

      Object.entries(JSON.parse(error.error)).forEach((part) => {
        console.error(part[0], part[1]);
      });

      console.error('=====');
    });
}
