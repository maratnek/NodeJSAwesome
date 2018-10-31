const express = require('express');

const router = express.Router();

const ParserNodeAwesome = require('./parser');
const parser = new ParserNodeAwesome();
// Get Posts
router.get('/', (req, res) => {
  if (req.query && req.query.hasOwnProperty('min_stars')) {
    console.log('Min stars: ', req.query.min_stars);
  }
});

// Add Post for filte min stars

// Delete Post

module.exports = router;
