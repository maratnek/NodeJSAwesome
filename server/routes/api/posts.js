const express = require('express');

const router = express.Router();

const GitHub = require('github-api');

const url = require('url');

//const pw = require('./password');
// basic auth
const gh = new GitHub({
  username: '',
  password: '',
  // username: pw.username,
  // password: pw.password,
});

const me = gh.getUser(); // no user specified defaults to the user for whom credentials were provided
const repo = gh.getRepo('sindresorhus', 'awesome-nodejs');

const repoInfo = [
  'updated_at',
  'stargazers_count',
];

function getRepoInfo(link) {
  console.log('link: ', link);
  const gitUrl = url.parse(link);
  if (!gitUrl || gitUrl.host != 'github.com') {
    console.log('error link', gitUrl.host);
    return;
  }
  let nodes = gitUrl.path.split(`/`);
  if(nodes.length == 3 && nodes[1] && nodes[2]) {
    let repos = gh.getRepo(nodes[1], nodes[2]);
    if (repos)
      return repos.getDetails();
  }
}

const SimpleMD = require('simple-markdown');

// Syntax analize
// synTree[0] --- heading2
// synTree[1] --- list content
// synTree[2-n] --- all about list content
// ---- heading2
// ------- heading3
// ------- list
// ------------ package or {heading -> package list}

// Get MD NodeJSAwesome and parse
repo.getReadme('master', true, async (err, data) => {

    let mdParse = SimpleMD.defaultBlockParse;

    // Parse Markdown
    let synTree = mdParse(data);
    synTree = synTree.filter((val, index, arr) => index > 0);

    function catContent(sum, it) {
      return sum + (it.content ? it.content : '');
    };
    // synTree[0] --- heading2
    if (synTree[0].content.reduce(catContent, '') != 'Contents')
      throw 'Exception MD Syntax: Not found ##Contents.';

    // synTree[1] --- list content
    if (synTree[1].type === 'list')
    {
      function getReduceList(list) {
        if (list)
        return list.map(pg => {
          return {
            content: pg[0].content.reduce(catContent,''),
            target: pg[0].target.substr(1).toLowerCase(),
            list: [],
          };
        });
      }

      function IsHead(head, level) {
        return (head.type == 'heading' && head.level == level);
      }
      function IsLinkContent(target, link) {
        return (target.content.reduce(catContent,'').toLowerCase() == link);
      }
      function IsList(node){
        return (node && node.type && node.type == 'list');
      }
      function getAllLinks(node){
        let packages = [];
        if (node && node.items)
          for (let pack of node.items) {
            console.log(pack);
            if (pack.length == 3 && pack[0].type == 'link' && pack[2].type == 'list')
              packages.push({
                name: pack[2].items.reduce(catContent,''),
                link: pack[0].target
              });
            else if (pack.length == 2 && pack[1].type == 'list')
              console.log('subitem', pack[1].items);
      }
      function findAllHeadLinks(tree, parts) {
        let targets = [];
        for (let i = 2; i < tree.length; i++) {
          for (let target of parts) {
            if (IsHead(tree[i],3) && IsLinkContent(tree[i], target.target)) {
              if (i + 1 < tree.length && tree[i+1] && IsList(tree[i+1]))
                targets.push({
                  name: target.content,
                  target: target.target,
                  links: getAllLinks(tree[i+1]),
                });
            }
          }
        }
      }

      // check all content link
      //console.log(synTree);
      let allContents = [];
      for (let section of synTree[1].items) {
        let link = section[0].target.substr(1).toLowerCase();
        // find links and list index
        for (let i = 2; i < synTree.length; i++) {
          if (IsHead(synTree[i], 2) && IsLinkContent(synTree[i], link))
          {
            console.log(link);
            let parts = getReduceList(section[2].items);
            let links = findAllHeadLinks(synTree, parts);
            //let packageFull = findAllPackageByTarget(parts, i);
            //allContents.push({link: link, packages: packageFull});
          }
        }
      }
      async function getItemData(item) {
        let info;
        if (item) {
          if (item[0] && item[0].type == 'link')
          return await getRepoInfo(item[0].target);
        }
        return info;
      };

      function getOurProperty(data, property) {
        if (data.hasOwnProperty(property[0]) &&
            data.hasOwnProperty(property[1]))
        {
            return {
              date: data[property[0]],
              star: data[property[1]]
            };
        } else {
          console.error(`Not known prop: ${property}`);
        }
      }
      getRepoInfo('https://github.com/mcollina/aedes')
      .then(data => {
        if (!data)
          return;
        let d = getOurProperty(data.data, repoInfo);
        console.log(d);
      })
      .catch(err => console.log('Error get repo info'));

      let data = await getRepoInfo('https://github.com/mcollina/aedes');
      if (data){
        console.log(typeof(data));
        let d = getOurProperty(data.data, repoInfo);
        console.log(d);
      }

      console.log('Synchronus');

      function findAllPackageByTarget(packages) {
        console.log('Find all packages');
      }
      return;

      function getListData(list) {
        let listNew = [];
        if (list.length && list.length == 2 && list[1].items)
        {
          for (let item of list[1].items) {
            console.log(item);
          }
        } else {
          console.log('Is Not Correct Construction');
        }
      };
    // check all package and add stars and last update
    console.log('check packages');
    //for (let content of allContents) {
    let content = allContents[0];
    lastIndex = content.index;
    for (let packages of content.packages) {
      //find link for the package
      for (let i = content.index; i < synTree.length; i++) {
        if (IsHead(synTree[i], 3) &&   synTree[i].content.reduce(catContent, '').toLowerCase() == packages.target
      )
      {
        let part = synTree[i + 1];
        //console.log('find head 3', packages.target, part);
        if (part.type && part.type == 'list')
        {
          ++i;
          if (part.items)
          for (let pack of part.items) {
            //console.log(pack);
            if (pack.length == 2 &&
              pack[1].type &&
              pack[1].type == 'list')
              //packages.push(getListData(pack));
              console.log('list pack');
              else if (pack.length == 3) {
                //packages.list.push(getItemData(pack));
                getItemData(pack);
                // packages.items = pack[2].items.reduce(catContent,'');
              }
            }
          }
        }
      }

    }
    //}

    //console.log(JSON.stringify(allContents, null, 2));

  }
});





// Get Posts
router.get('/', (req, res) => {
  if (req.query && req.query.min_stars) {
    console.log('Min stars: ', req.query.min_stars);
  }
});

// Add Post for filte min stars

// Delete Post

module.exports = router;
