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
      this.test();
      // this.getPageFragment(10);
      // this.pageSlice(8);
      // this.pageSlice(7);
      // this.pageSlice(6)
      pageSlice(this.packages, 5);
      // this.pageSlice(4);
      // this.pageSlice(3);
      // this.pageSlice(2);
      // this.pageSlice(1);
      // this.pageSlice(0);
    });
  }

  test() {
    // let fltrData = this.getRepoDataByFilter(750);
    // console.log(fltrData.length);
    // console.log(JSON.stringify(fltrData,null,2));

    // this.packages = [
    //     {
    //       name: 'name1',
    //       list: [
    //         {name: 'pack1'},
    //         {name: 'pack2'},
    //         {name: 'pack3'},
    //         {name: 'pack4'},
    //       ],
    //     },
    //     {
    //       name: 'name2',
    //       list: [
    //         {name: 'pack5'},
    //         {name: 'pack6'},
    //         {name: 'pack7'},
    //         {name: 'pack8'},
    //         {name: 'pack9'},
    //         {name: 'pack10'},
    //         {name: 'pack11'},
    //       ],
    //     },
    //     {
    //       name: 'name3',
    //       list: [
    //         {name: 'pack12'},
    //         {name: 'pack13'},
    //         {name: 'pack14'},
    //       ],
    //     },
    //     {
    //       name: 'name4',
    //       list: [
    //         {name: 'pack15'},
    //         {name: 'pack16'},
    //       ],
    //     },
    //     {
    //       name: 'name5',
    //       list: [
    //         {name: 'pack17'},
    //         {name: 'pack18'},
    //         {name: 'pack19'},
    //         {name: 'pack20'},
    //         {name: 'pack21'},
    //       ],
    //     },
    // ];

  }

  // pageSlice(count = 3) {
  //   if (!this.packages.length || count == 0)
  //     return
  //   let book = [];
  //   let page = [];
  //   let pageLength = (page) => {
  //     return page.reduce((sum, pack) => sum += pack.list.length, 0);
  //   }
  //   console.log('Page By ', count);
  //   for (let [i,pack] of this.packages.entries()) {
  //     // console.log('Pack ', pack.list.length);
  //     if (pack.list.length < count - pageLength(page)) {
  //       page.push(pack);
  //     } else if (pack.list.length > count - pageLength(page)) {
  //       // console.log(count - pageLength(page), page);
  //       let chunk = this.getChunk(pack, count - pageLength(page));
  //       // console.log(chunk);
  //       page.push(chunk[0]);
  //       book.push(page);
  //       page = [];
  //       // console.log(book, ' - ',page);
  //       if (chunk[1].list.length > count) {
  //         let packS = this.packSlice(chunk[1], count);
  //         for (let it of packS) {
  //           if (it.list.length == count) {
  //             book.push([it]);
  //           } else {
  //             page.push(it);
  //           }
  //         }
  //       } else if (chunk[1].list.length < count) {
  //         page.push(chunk[1]);
  //       } else {
  //         book.push(chunk[1]);
  //       }
  //     } else {
  //       page.push(pack);
  //       book.push(page);
  //       page = [];
  //     }
  //   }
  //   if (page.length) {
  //     book.push(page);
  //   }
  //   for (let [i, page] of book.entries()) {
  //     console.log('page ', i + 1, JSON.stringify(page,null,2));
  //   }
  //   return book;
  // }

  getAllData(){
    if (this.data)
      return this.data[0];
    else
      return 'Not parse data';
  }


  // getPageFragment(pageCount = 50) {
  //   console.log('Page Fragment: count - ', pageCount);
  //   if (!this.data)
  //     return;
  //   let pageData = [];
  //
  //   function sanitizeForward(object, keyList) {
  //     if (object.hasOwnProperty(keyList))
  //     return Object.keys(object)
  //       .filter(key => key != keyList)
  //       .reduce((obj, key) => {
  //         obj[key] =   object[key];
  //         return obj;
  //       }, {});
  //   }
  //
  //   function addPage(pack, pd) {
  //     let body = sanitizeForward(pack, 'list');
  //     if (body) {
  //       body.list = pd;
  //       console.log(body);
  //       pageData.push(body);
  //       pd = [];
  //     }
  //   }
  //
  //   let pCount = 1;
  //   let packages = this.data[0].packages;
  //   if (packages) {
  //     let count = 0;
  //     let chapList = [];
  //     let bodyList = [];
  //     for (let pack of packages) {
  //       let body = sanitizeForward(pack, 'list');
  //       for (let [i, link] of pack.list.entries()) {
  //         if (link.type == 'link') {
  //           ++count;
  //           chapList.push(link);
  //           if (count == pageCount) {
  //             body.list = chapList;
  //             console.log(body);
  //             chapList = [];
  //             count = 0;
  //             bodyList.push(body);
  //             pageData.push({ page: pCount++, list: bodyList });
  //             bodyList = [];
  //           } else if (pack.list.length == i + 1) {
  //             body.list = chapList;
  //             console.log(body);
  //             bodyList.push(body);
  //             chapList = [];
  //           }
  //         } else if (link.type == 'list') {
  //           for (let sublink of link.list) {
  //             let subbody = sanitizeForward(sublink, 'list');
  //             body.list = subbody;
  //             if (sublink.type == 'link')
  //               ;//++count;
  //           }
  //         }
  //       }
  //     }
  //   }
    //console.log(JSON.stringify(pageData, null, 1));
    // return pageData;
  // }

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
