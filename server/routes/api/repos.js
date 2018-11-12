const GitHub = require('github-api');
const pw = require('./password');
const url = require('url');

if (process.env) {
  console.log('GitHub username:', process.env.GITHUB_USERNAME);
}

const auth = {
  username: pw.username,
  password: pw.password,
};

// basic auth
const gh = new GitHub(auth);

const repo = {
  user: 'sindresorhus',
  name: 'awesome-nodejs',
}

module.exports = {

  getRateLimit: async () => {
    try {
      let resp = await gh.getRateLimit().getRateLimit();
      // console.log('Limit ' + resp.data.rate.limit + ' remaining: ' + resp.data.rate.remaining);
      // console.log(resp.data);
      // console.log('Reset date: ' + new Date(resp.data.rate.reset * 1000));
      // console.log('Reset search date: ' + new Date(resp.data.resources.search.reset * 1000));
      // console.log('Reset resource core: ' + new Date(resp.data.resources.core.reset * 1000));

      let intervalMs =  new Date(resp.data.resources.search.reset * 1000) - Date.now();
      return resp.data.rate.remaining;
    } catch (e) {
      console.log('Error fetching rate limit', error.message);
    }
  },

  getReadmeData: async () => {
    const repository = gh.getRepo(repo.user, repo.name);
    return await repository.getReadme(this.branch, true);
  },

  getGitHubInfo: async (link) => {
    if (!link)
      return;
    const gitUrl = url.parse(link);
    if (!gitUrl || gitUrl.host != 'github.com') {
      console.log('Not github link: ', gitUrl.host);
      return link;
    }
    let nodes = gitUrl.path.split(`/`);
    if (nodes.length == 3 && nodes[1] && nodes[2]) {
      let repos = gh.getRepo(nodes[1], nodes[2]);
      if (repos) {
        try {
          return await repos.getDetails();
        } catch (e) {
          let resp = await gh.getRateLimit().getRateLimit();
          let intervalMs =  new Date(resp.data.resources.search.reset * 1000) - Date.now();
          console.log('Error github:', link, intervalMs, e);
        }
      }
    }
    return;
  },

}
