const GitHub = require('github-api');
const pw = require('./password');

if (process.env)
  console.log('GitHub username:', process.env.GITHUB_USERNAME);
// basic auth
const gh = new GitHub({
  username: pw.username,
  password: pw.password,
});

const repo = {
  user: 'sindresorhus',
  name: 'awesome-nodejs',
}

module.exports = async function getReadmeData() {
  const repository = gh.getRepo(repo.user, repo.name);
  return await repository.getReadme(this.branch, true);
}
