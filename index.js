console.log('NodeJS Awesome');

const pw = require('./password');

console.log(pw.username);
console.log(pw.password);

const GitHub = require('github-api');

// basic auth
const gh = new GitHub({
   username: pw.username,
   password: pw.password,
   /* also acceptable:
      token: 'MY_OAUTH_TOKEN'
    */
});

const me = gh.getUser(); // no user specified defaults to the user for whom credentials were provided
me.listNotifications(function(err, notifications) {
   // do some stuff
   console.log(notifications);
});

const clayreimann = gh.getUser('clayreimann');
clayreimann.listStarredRepos(function(err, repos) {
   // look at all the starred repos!
   console.log(repos);
});

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
