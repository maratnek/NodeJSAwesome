const SimpleMD = require('simple-markdown');
const GitHub = require('github-api');
const url = require('url');
const pw = require('./password');
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
      star: data[property[1]]
    };
  } else {
    console.error(`Not known prop: ${property}`);
  }
}

function getReduceList(list) {
  if (list)
  return list.map(pg => {
    return {
      content: pg[0].content.reduce(catContent, ''),
      target: pg[0].target.substr(1).toLowerCase(),
      list: [],
    };
  });
}

// Syntax analize
// synTree[0] --- heading2
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
    this.repoName ='awesome-nodejs';
    this.init(()=>{
      console.log(this.repoName);
      //this.test();
      // this.getPageFragment(10);
      this.getPageSplit(10);
    });
  }

  test() {
    let fltrData = this.getRepoDataByFilter(750);
    console.log(fltrData.length);
    console.log(JSON.stringify(fltrData,null,2));
  }

  getAllData(){
    if (this.data)
      return this.data[0];
    else
      return 'Not parse data';
  }

  sanitizeForward(object, keyList) {
    if (object.hasOwnProperty(keyList))
    return Object.keys(object)
    .filter(key => key != keyList)
    .reduce((obj, key) => {
      obj[key] =  object[key];
      return obj;
    }, {});
  }

  splitPackage(pack, count) {
    // console.log(pack);
    let body = this.sanitizeForward(pack, 'list');
    let arr = [];
    let subarr = [];
    let i = 0;
    let length = pack.list.length;
    while (length >= i) {
      arr.push(pack.list.slice(i, i + count))
      i += count;
    }
    // console.log(JSON.stringify(arr));
    // for (let [index, item] of pack.list.entries()) {
    //   //console.log(item);
    //   if (item.type == 'link') {
    //     subarr.push(item);
    //     if (subarr.length == count) {
    //       //console.log(subarr);
    //       body.list = subarr;
    //       arr.push(body);
    //       console.log(body);
    //       subarr = [];
    //     }
    //   }
    // }
    // if (subarr.length) {
    //   body.list = subarr;
    //   arr.push(body);
    // }
    // console.log(arr);
    return arr;
  }

  getPageSplit(count = 50) {
    console.log('Page Split', count);
    if (!this.data)
      return;
    let book = [];
    let page = [];
    let mod = 0;
    let packages = this.data[0].packages;
    for (let part of packages) {
      console.log(part.name, ' ', part.list.length, ' m:', mod);
      mod = part.list.length - count + mod;
      if (mod < 0) {
        page.push(part);
      } else if (mod == 0) {
        page.push(part);
        book.push(page);
        page = [];
      } else {
        let p = this.splitPackage(part, count);
        for (let t of p) {
          console.log(t.list.length);
        }
        if (!p) return;
        for (let iter of p) {
          if (iter.list.length == count) {
            page.push(iter);
            book.push(page);
            page = [];
          } else {
            page.push(iter);
            mod = iter.list.length;
          }
        }
      }
    }
  }

  getPageFragment(pageCount = 50) {
    console.log('Page Fragment: count - ', pageCount);
    if (!this.data)
      return;
    let pageData = [];

    function sanitizeForward(object, keyList) {
      if (object.hasOwnProperty(keyList))
      return Object.keys(object)
        .filter(key => key != keyList)
        .reduce((obj, key) => {
          obj[key] =   object[key];
          return obj;
        }, {});
    }

    function addPage(pack, pd) {
      let body = sanitizeForward(pack, 'list');
      if (body) {
        body.list = pd;
        console.log(body);
        pageData.push(body);
        pd = [];
      }
    }

    let pCount = 1;
    let packages = this.data[0].packages;
    if (packages) {
      let count = 0;
      let chapList = [];
      let bodyList = [];
      for (let pack of packages) {
        let body = sanitizeForward(pack, 'list');
        for (let [i, link] of pack.list.entries()) {
          if (link.type == 'link') {
            ++count;
            chapList.push(link);
            if (count == pageCount) {
              body.list = chapList;
              console.log(body);
              chapList = [];
              count = 0;
              bodyList.push(body);
              pageData.push({ page: pCount++, list: bodyList });
              bodyList = [];
            } else if (pack.list.length == i + 1) {
              body.list = chapList;
              console.log(body);
              bodyList.push(body);
              chapList = [];
            }
          } else if (link.type == 'list') {
            for (let sublink of link.list) {
              let subbody = sanitizeForward(sublink, 'list');
              body.list = subbody;
              if (sublink.type == 'link')
                ;//++count;
            }
          }
        }
      }
    }
    //console.log(JSON.stringify(pageData, null, 1));
    return pageData;
  }

  getRepoDataByFilter(filter) {
    //console.log(this.data);
    if (!this.data || !filter)
      return;
    let filterData = [];
    //get packages
    let packages = this.data[0].packages;
    if (packages) {
        for (let pack of packages) {
          if (pack.links) {
            for (let link of pack.list) {
              console.log(link);
              if (link.type == 'link') {
                if (link.property && link.property.star && link.property.star >= filter)
                  chapList.push(link);
              } else if (link.type == 'list') {
              console.log('list');
                // for (let listLink of link.list) {
                //   if (property && property.star && property.star >= filter)
                //     chapList.push(link);
                // }
              }
            }
          }

           if (chapList.length)
             filterData.push({name: pack.name, list: chapList});
        }
    }
    // let resources = this.data[1].packages;
    return filterData;
  }

  init(cb) {
    console.log('Init Parser');
    fs.readFile(this.fileName, async (err, data) => {
      if (err) {
        this.data = await this.getParseData();
        if (!this.data)
          return;
        fs.writeFile(this.fileName, JSON.stringify(this.data), (err) => {
          if (err) throw err;
          console.log('The file has been saved!');
        });
        if (cb)
          cb();
      } else {
        this.data = JSON.parse(data);
        cb();
        //console.log(JSON.stringify(this.data,null,2));
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
    if (!data)
      return;

    // TODO: check
    if (data.data)
      data = data.data;
    let mdParse = SimpleMD.defaultBlockParse;

    // Parse Markdown
    let synTree = mdParse(data);
    synTree = synTree.filter((val, index, arr) => index > 0);

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
      //console.log(JSON.stringify(allContents, null, 2));
      console.log('Synchronus');
      return allContents;

    }
  }

}
