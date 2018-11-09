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
  return (target.content.reduce(cancatContent, '').toLowerCase() == link);
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
      content: pakcageHead[0].content.reduce(catContent, ''),
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
        let list = getListContent(synTree[1].items);
        if (list) {
          let bodyList = findBodyLists(synTree, list);
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

function getListContent(parts) {
  // console.log('is iterable', isIterable(parts));
  if (!isIterable(parts))
    return;
  for (let part of parts) {
    console.log(part);
    if (!part.length || !part[0].target)
      continue;
    let link = part[0].target.substr(1).toLowerCase();
    // find links and list index
    // for (let i = 2; i < synTree.length; i++) {
    //   if (IsHead(synTree[i], 2) && IsLinkContent(synTree[i], link))
    //   {
    //     console.log(link);
    //     let parts = getReduceList(section[2].items);
    //     let links  = await findAllHeadLinks(synTree, parts);
    //     allContents.push({ name: link, packages: links });
    //   }
    }
  }

}

function findBodyLists(tree, list) {
  // find list in tree
  return;
}

function getAllGitHubInfo(bodyList) {
  // get all GitHub info
  return;
}

parse();
