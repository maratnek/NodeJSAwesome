
const express = require('express');

const router = express.Router();

const ParserNodeAwesome = require('./parser');
// creat and initialize
const parser = new ParserNodeAwesome();

// Get Posts
router.get('/', (req, res) => {
  if (parser) {
    console.log(req.query);
    if (req.query && req.query.hasOwnProperty('min_stars')) {
      console.log('Min stars: ', req.query.min_stars);
      let data = parser.filterPages(req.query.min_stars);
      res.send(data);
    } else {
      // let data = parser.getAllData();
      let data = parser.getAllPages();
      console.log('All', req.query);
      res.send(data);
    }
  } else {
      res.send('Error 404');
  }
});

// Add Post for filte min stars

// Delete Post

module.exports = router;
