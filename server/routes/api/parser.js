const SimpleMD = require('simple-markdown');
const GitHub = require('github-api');
const url = require('url');
const pw = require('./password');
const page = require('./page');
const pageLength = page.pageLength;
const packDeepLength = page.packDeepLength;
const sanitizeForward = page.sanitizeForward;
const getChunk = page.getChunk;
const getDeepChunk = page.getDeepChunk;
const packDeepSlice = page.packDeepSlice;
const pageSlice = page.pageSlice;

if (process.env)
  console.log('GitHub username:', process.env.GITHUB_USERNAME);
// basic auth
const gh = new GitHub({
  username: pw.username,
  password: pw.password,
});
const repoInfo = [
  'updated_at',
  'stargazers_count',
];

function getRepoInfo(link) {
  if (!link)
    return;
  const gitUrl = url.parse(link);
  if (!gitUrl || gitUrl.host != 'github.com') {
    console.log('Not github link: ', gitUrl.host);
    return link;
  }
  let nodes = gitUrl.path.split(`/`);
  if(nodes.length == 3 && nodes[1] && nodes[2]) {
    let repos = gh.getRepo(nodes[1], nodes[2]);
    if (repos)
      return repos.getDetails();
  }
}

function IsHead(head, level) {
  return (head.type == 'heading' && head.level == level);
}

function IsLinkContent(target, link) {
  return (target.content.reduce(catContent, '').toLowerCase() == link);
}

function IsList(node) {
  return (node && node.type && node.type == 'list');
}

function catContent(sum, it) {
  return sum + (it.content ? it.content : '');
};

function getProperty(data, property) {
  if (data.hasOwnProperty(property[0]) &&
  data.hasOwnProperty(property[1]))
  {
    return {
      date: data[property[0]],
      star: data[property[1]],
    };
  } else {
    console.error(`Not known prop: ${property}`);
  }
}

function getReduceList(list) {
  if (list)
    return list.map(pakcageHead => {
      return {
        content: pakcageHead[0].content.reduce(catContent, ''),
        target: pakcageHead[0].target.substr(1).toLowerCase(),
        list: [],
      };
    });
}

function expiredFile(file) {

}

// Syntax analize
// synTree[0] --- heading2 Contents
// synTree[1] --- list content
// synTree[2-n] --- all about list content
// ---- heading2
// ------- heading3
// ------- list
// ------------ package or {heading -> package list}

const fs = require('fs');

module.exports = class ParserNodeAwesome {
  constructor() {
    this.fileName = 'node-awesome.json';
    this.branch = 'master';
    this.user = 'sindresorhus';
    this.repoName = 'awesome-nodejs';
    this.data = null;
    this.init();
  }

  filterPages(filterNum, count = 30) {
    console.log('filter', filterNum);
    let data = this.getRepoDataByFilter(filterNum);
    if (data) {
      console.log(data);
      let packages = pageSlice(data, count);
      if (packages) {
        return packages;
      } else {
        return 'Not parse data';
      }
    }
  }

  getAllPages(count = 30) {
    let packages = pageSlice(this.packages, count);
    if (packages) {
      return packages;
    } else {
      return 'Not parse data';
    }
  }

  // filter
  getRepoDataByFilter(filter) {
    if (!this.data || !filter)
      return;
    let filterPackages = [];

    // get packages
    let packages = this.data[0].packages;
    let IsStar = (pack, filter) => pack.property
    && pack.property.star && pack.property.star >= filter;

    if (packages) {
      filterPackages = packages.filter(chapter => {
        chapter.list = chapter.list.filter(pack => {
          if (pack.type == 'link' && IsStar(pack, filter))
            return pack;
          else if (pack.type == 'list') {
            pack.list = pack.list.filter(subpack => {
              return subpack.type == 'link' && IsStar(subpack, filter);
            });
            return pack;
          }
        });
        return chapter;
      });
    }

    return filterPackages;
  }



  init() {
    fs.readFile(this.fileName, async (err, data) => {
      if (err || expiredFile(this.filename)) {
        this.data = await this.getParseData();
        if (!this.data)
          return;
        fs.writeFile(this.fileName, JSON.stringify(this.data), (err) => {
          if (err) throw err;
          console.log('The file has been saved!');
        });
      } else {
        this.data = JSON.parse(data);
      }
    });
  }

  async getReadme() {
    try {
      const repo = gh.getRepo(this.user, this.repoName);
      return await repo.getReadme(this.branch, true);
    } catch (e) {
      console.error(`Error get readme ${e}`);
    }
  }

  async getParseData() {
    let data = await this.getReadme();
    if (!data || !data.data)
      return;

    data = data.data;
    let mdParse = SimpleMD.defaultBlockParse;

    // Parse Markdown
    let synTree = mdParse(data);
    synTree = synTree.filter((val, index) => index > 0);

    // synTree[0] --- heading2
    if (synTree[0].content.reduce(catContent, '') != 'Contents')
      throw 'Exception MD Syntax: Not found ##Contents.';

    // synTree[1] --- list content
    if (synTree[1].type === 'list')
    {
      async function getAllLinks(node) {
        let packages = [];
        if (node && node.items)
          for (let pack of node.items) {
            if (pack.length == 3 && pack[0].type == 'link' && pack[2].type == 'list') {
              try {
                let data = await getRepoInfo(pack[0].target);
                let info;
                if (data && data.hasOwnProperty('data')) {
                  info = getProperty(data.data, repoInfo);
                  console.log(info);
                } else {
                  info = data; //maybe promise
                }
                //console.log(JSON.stringify(node, null, 2));
                packages.push({
                  type: 'link',
                  name: pack[0].content.reduce(catContent, ''),
                  description: pack[2].items[0].reduce(catContent, ''),
                  property: info,
                  link: pack[0].target,
                });
              } catch (err) {
                console.error('Error package: ', err);
              }
            } else if (pack.length == 2 && pack[1].type == 'list') {
              console.log(JSON.stringify(pack, null, 2));
              packages.push({
                name: pack[0].content,
                type: 'list',
                list: await getAllLinks(pack[1]),
              });
            }
          }
        return packages;
      }

      async function findAllHeadLinks(tree, parts) {
        let targets = [];
        for (let i = 2; i < tree.length; i++) {
          for (let target of parts) {
            if (IsHead(tree[i], 3) && IsLinkContent(tree[i], target.target)) {
              if (i + 1 < tree.length && tree[i + 1] && IsList(tree[i + 1]))
              targets.push({
                name: target.content,
                list: await getAllLinks(tree[i + 1]),
              });
            }
          }
        }
        return targets;
      }
      // check all content link
      let allContents = [];
      for (let section of synTree[1].items) {
        let link = section[0].target.substr(1).toLowerCase();
        // find links and list index
        for (let i = 2; i < synTree.length; i++) {
          if (IsHead(synTree[i], 2) && IsLinkContent(synTree[i], link))
          {
            console.log(link);
            let parts = getReduceList(section[2].items);
            let links  = await findAllHeadLinks(synTree, parts);
            allContents.push({ name: link, packages: links });
          }
        }
      }
      console.log('Synchronus');
      return allContents;

    }
  }

}
