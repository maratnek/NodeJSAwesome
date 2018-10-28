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
  const gitUrl = url.parse(link);
  //console.log(gitUrl)
  if (!gitUrl || gitUrl.host != 'github.com')
  {
    console.log(gitUrl.host);
    return;
  }
  let res = gitUrl.path.split(`/`);
  if(res.length == 3)
  try {
    let repos = gh.getRepo(res[1], res[2]);
    if (repos)
    {
      let info;
      await repos.getDetails( (err, data) => {
        console.log(link);
        info = {
          date: data[repoInfo[0]],
          star: data[repoInfo[1]],
        }
      });
      return info;
    }
  } catch (err) {
    console.log(err);
  }
  //console.log(link);
  //console.log(repository);
  // repository.getDetails((err,data) => {
  //   console.log(data);
  // });

}

//const markdownit = require('markdown-it');
// const md = new markdownit();
const SimpleMD = require('simple-markdown');

  repo.getReadme('master', true, (err, data) => {

    let mdParse = SimpleMD.defaultBlockParse;
    let mdOutput = SimpleMD.defaultOutput;

    let synTree = mdParse(data);
    synTree = synTree.filter((val, index, arr) => {return index > 0;});

    function catContent(sum, it) {
      return sum + (it.content ? it.content : '');
    }
    // synTree[0] --- heading2
    // synTree[1] --- list content
    // synTree[2-n] --- all about list content
    // ---- heading2
    // ------- heading3
    // ------- list
    if (synTree[0].content.reduce(catContent, '') == 'Contents')
      console.log('Contents');
    else
      throw 'Exception: Not found ##Contents';
    console.log(synTree[1]);

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
        return list;
      }

      // check all content link
      let allContents = [];
      for (let section of synTree[1].items) {
        let link = section[0].target.substr(1).toLowerCase();
        // find links and list index
        for (let i = 2; i < synTree.length; i++) {
          if (synTree[i].level == 2 &&
              synTree[i].type == 'heading' &&
              synTree[i].content.reduce(catContent,'').toLowerCase() == link
            )
          {
            let packages = getReduceList(section[2].items);
            allContents.push({link: link, index: i, packages:packages});
          }
        }
      }



      async function getItemData(item) {
        console.log(item);
        if (item) {
          if (item[0] && item[0].type == 'link')
            return getRepoInfo(item[0].target);
        }

      };

      function getListData(list) {
        let listNew = [];
        console.log(list);
        if (list.length && list.length == 3 && list[2].items)
          for (let item of list[2].items) {
            //console.log(item);
          }
      };


      // check all package and add stars and last update
      for (let content of allContents) {
        lastIndex = content.index;
        for (let packages of content.packages) {
          for (let i = content.index; i < synTree.length; i++) {
            if (synTree[i].level == 3 &&
              synTree[i].type == 'heading' &&
              synTree[i].content.reduce(catContent, '').toLowerCase() == packages.target
            )
            {
              let part = synTree[i + 1];
              if (part.type && part.type == 'list')
              {
                ++i;
                if (part.items)
                  for (let pack of part.items) {
                    //console.log(pack);
                    if (pack.length == 2 && pack[1].type && pack[1].type == 'list')
                      //for (let chapter of pack[1].items) {
                        //console.log('chapter', chapter);
                        getListData(pack);
                      //}
                    else if (pack.length == 3){
                      packages.list.push(getItemData(pack));
                      // packages.items = pack[2].items.reduce(catContent,'');
                    }
                  }
              }
            }
          }



        }
      }

      //console.log(JSON.stringify(allContents, null, 2));

    }
    // console.log(synTree[0]);
    // console.log(synTree[2]);
     // console.log(synTree[3]);
     // console.log(synTree[4]);
     // console.log(synTree[5]);
     // console.log(synTree[6]);
     // console.log(synTree[7]);


    //const blb    = new Blob(["Lorem ipsum sit"], {type: "text/plain"});
    //console.log(data);
    //let result = md.parse(data);
    //console.log(result);
    // for (let parag of result) {
    //   console.log(parag);
    //
    // }
    //console.log(obj);
    //fs.writeFileSync('file.txt', data, 'utf8');
    // const reader = new FileReader();
    //
    // // This fires after the blob has been read/loaded.
    // reader.addEventListener('loadend', (e) => {
    //   const text = e.srcElement.result;
    //   console.log(text);
    //   //res.send(JSON.parse(data));
    // });
    //
    // // Start reading the blob as text.
    // reader.readAsText(data);
    //console.log(data);
  });





// Get Posts
router.get('/', (req, res) => {
  if (req.query && req.query.min_stars)
    console.log('Min stars: ', req.query.min_stars);
  console.log('get request');
  me.listNotifications(function(err, notifications) {
    // do some stuff
    //console.log(notifications);
    //res.send(notifications);
  });

  // const clayreimann = gh.getUser('sindresorhus');
  // clayreimann.listStarredRepos(function(err, repos) {
  //   // look at all the starred repos!
  //   //console.log(repos);
  //   res.send(repos);
  // });

  repo.getBranch('master', (err, data) => {
    //console.log(data);
    //res.send(data);
  });
  repo.getDetails((err, data) => {
    //res.send(data);
  });
  console.log(repo);

  repo.listCommits({}, (err, data) => {
    //res.send(data);
  });
});

// Add Post

// Delete Post

module.exports = router;
