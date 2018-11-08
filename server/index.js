console.log('NodeJS Awesome');

// Express
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());


const posts = require('./routes/api/posts');
app.use('/api', posts);
// production
if (process.env.NODE_ENV === 'production') {
  //static folders
  app.use(express.static(__dirname + '/public/'));

  // handle spa
  app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));
}


const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
