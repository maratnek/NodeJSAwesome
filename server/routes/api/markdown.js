const readme = require('./readme.js');
const fs = require('fs');

const md = require('simple-markdown');
const mdParse = md.defaultBlockParse;

async function parse() {
  console.log('Parse');
  let request = await readme();

  if (request.status != 200 || !request.data)
    return;

  let data = request.data;
  let result = mdParse(data);
  result = result.slice(1);
  fs.writeFileSync('file.json',JSON.stringify(result, null, 2));
  syntaxAnaliseMD(result);

  // find content
  // get content list
  console.log('Synchronus');
  getListContent(null);
};

// utils
function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}
// -- utils

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
  return (target.content.reduce(cancatContent, '') == link);
}

function IsList(node) {
  return (node && node.type && node.type == 'list');
}

function cancatContent(sum, it) {
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
      content: pakcageHead[0].content.reduce(cancatContent, ''),
      target: pakcageHead[0].target.substr(1).toLowerCase(),
      list: [],
    };
  });
}

// Syntax analize
// synTree[0] --- heading2 Contents
// synTree[1] --- list content
// synTree[2-n] --- all about list content
// ---- heading2
// ------- heading3
// ------- list
// ------------ package or {heading -> package list}
function syntaxAnaliseMD(synTree) {
  // syntax analise and clear not use data
  // console.trace('syntax analise');
  console.log('Syntax Analise');
  console.log(synTree);
  let fullList = [];

  // synTree[0] --- heading2
  if (existContent(synTree[0])) {
      if (existList(synTree[1])) {
        let list = getListContent(synTree[1].items, synTree, 2);
        if (list) {
          let bodyList = findBodyLists(list, synTree);
          console.log(JSON.stringify(bodyList, null, 2));
          if (bodyList) {
            fullList = getAllGitHubInfo(bodyList);
          }
        }
      } else {
        console.log('Not content list');
      }
  }
  return fullList;
}

function existContent(content) {
    // synTree[0] --- heading2
    console.log(content);
    if (IsHead(content, 2)) {
      let data = content.content.reduce(cancatContent, '');
      if (data == 'Contents')
        return true;
    }
    return false;
}

function existList(list) {
  console.log(list);
  if (list.type === 'list')
    return true;
  return false;
}

function getListContent(parts, synTree, index) {
  if (!isIterable(parts))
    return;
  let content = [];
  for (let part of parts) {
    if (!part.length || !part[0].target || !part[2] || !part[2].items)
      continue;
    console.log(part[0]);
    let link = part[0].content.reduce(cancatContent,'');
    // find links and list index
    for (let i = index; i < synTree.length; i++) {
      if (IsHead(synTree[i], 2) && IsLinkContent(synTree[i], link)) {
        index = i;
        content.push({name: link, part: part[2].items, index: index})
      }
    }
  }
  return content;
}

function findBodyLists(list, synTree) {
  // find list in tree
  if (!isIterable(list))
    return;
    console.log('list length: ', list.length);
  list = list.map((p) => {
    console.log('part length: ', p.part.length);
    let index = p.index;
    p.part = p.part.map(ch => {
      // console.log(ch);
      if (!ch.length || !ch[0] || ch[0].type !== 'link')
        next;
      let link = ch[0].content.reduce(cancatContent, '');
      let newChap = {name: link};
      for (let i = index; i < synTree.length; i++) {
        // get body
// n ------- heading3
// n + 1------- list
// ------------ package or {heading -> package list}
        if (IsHead(synTree[i], 3) && IsLinkContent(synTree[i], link)) {
          index = i;
          let head = synTree[i];
          console.log(head.content.reduce(cancatContent,''));
          ++i;
          let body = synTree[i];
          if (body.type === 'list') {
          // console.log(body.items);
            if (body.items) {
              newChap.list = body.items.map((pack) => {
                if (pack.length && pack[0].type == 'text' && IsList(pack[1])) {
                  console.log(pack[1].items);
                  return pack[1].items;
                } else if (pack.length && pack[0].type == 'link') {
                  return {list: pack[0].target, type: pack[0].type, content: pack[0].content.reduce(cancatContent, '')};
                }
              });

            }

          }
          // content.push({name: link, part: part[2].items, index: index})
        }
      }
      return newChap;
    });
    return p;
  });
  console.log('list length: ', list.length);

  return list;
}

function getAllGitHubInfo(bodyList) {
  // get all GitHub info
  return;
}

parse();
