const express = require('express');

const router = express.Router();

const GitHub = require('github-api');

const url = require('url');

const pw = require('./password');
// basic auth
const gh = new GitHub({
  username: pw.username,
  password: pw.password,
});

const me = gh.getUser(); // no user specified defaults to the user for whom credentials were provided
const repo = gh.getRepo('sindresorhus', 'awesome-nodejs');

const repoInfo = [
  'updated_at',
  'stargazers_count',
];

async function getRepoInfo(link) {
  console.log('link: ', link);
  const gitUrl = url.parse(link);
  if (!gitUrl || gitUrl.host != 'github.com')
  {
    console.log('error link', gitUrl.host);
    return;
  }
  let res = gitUrl.path.split(`/`);
  if(res.length == 3 && res[1] && res[2])
  {
    let repos = gh.getRepo(res[1], res[2]);
    if (repos)
    {
      let info;
      try {
        let data = await repos.getDetails();
        if (data
          // &&
          // (repoInfo[0] in data) && (repoInfo[1] in data))
          // data.hasOwnProperty(repoInfo[0]) &&
          // data.hasOwnProperty(repoInfo[1]))
        )
          {
        console.log(data);
            info = {
              date: data[repoInfo[0]],
              star: data[repoInfo[1]]
            };
            console.log(info);
            return info;
          }
        } catch (err) {
          //console.log(err);
        }
      }
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
  repo.getReadme('master', true, (err, data) => {

    let mdParse = SimpleMD.defaultBlockParse;

    // Parse Markdown
    let synTree = mdParse(data);
    synTree = synTree.filter((val, index, arr) => index > 0);

    function catContent(sum, it) {
      return sum + (it.content ? it.content : '');
    };
    if (synTree[0].content.reduce(catContent, '') != 'Contents')
      throw 'Exception MD Syntax: Not found ##Contents.';

    if (synTree[1].type === 'list')
    {
      function getReduceList(list) {
        if (list)
        return list.map(pg => {
          let content = pg[0].content;
          let cat = content.reduce(catContent, '');
          return {
            content: cat,
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
            let packageFull = findAllPackage(parts);
            allContents.push({link: link, index: i, packages: packageFull});
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

      getRepoInfo('https://github.com/mcollina/aedes')
      .then(data => console.log(data));

      function findAllPackage(packages) {
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
        //return list;
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
