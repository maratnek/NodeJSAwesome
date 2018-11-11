const repo = require('./repos.js');
const fs = require('fs');

const md = require('simple-markdown');
const mdParse = md.defaultBlockParse;

const utils = require('./utils');

module.exports = async function parse() {
  console.log('Parse');
  let request = await repo.getReadmeData();

  if (request.status != 200 || !request.data)
    return;

  let data = request.data;
  let result = mdParse(data);
  result = result.slice(1);
  console.log('Analise data');
  let mdCore = await syntaxAnaliseMD(result);
  return mdCore;
};

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
  if (!property)
    return;
  let d = {};
  for (let p of property) {
    if (data.hasOwnProperty(p[0]))
      d[p[1]] = data[p[0]];
    else
      console.error(`Not known prop: ${p}`);
  }

  return d;
}

// Syntax analize
// synTree[0] --- heading2 Contents
// synTree[1] --- list content
// synTree[2-n] --- all about list content
// ---- heading2
// ------- heading3
// ------- list
// ------------ package or {heading -> package list}
async function syntaxAnaliseMD(synTree) {
  // syntax analise and clear not use data
  // console.trace('syntax analise');
  console.log('Syntax Analise');
  // console.log(synTree);
  let fullList = [];

  // synTree[0] --- heading2
  if (existContent(synTree[0])) {
    if (existList(synTree[1])) {
      let list = getListContent(synTree[1].items, synTree, 2);
      if (list) {
        fullList = findBodyLists(list, synTree);
        if (fullList) {
          fullList = await getAllGitHubInfo(fullList);
          console.log('get All github info');
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
    if (!utils.isIterable(parts))
    return;
  let content = [];
  for (let part of parts) {
    if (!part.length || !part[0].target || !part[2] || !part[2].items)
      continue;
    let link = part[0].content.reduce(cancatContent, '');
    // find links and list index
    for (let i = index; i < synTree.length; i++) {
      if (IsHead(synTree[i], 2) && IsLinkContent(synTree[i], link)) {
        index = i;
        content.push({ name: link, part: part[2].items, index: index });
      }
    }
  }
  return content;
}

function getLink(pack) {
  let packLink = pack[0];
  let content;
  if (pack.length == 3 && pack[2].items) {
    // console.log(pack[2].items);
    content = pack[2].items.reduce((str, item) => {
      str += item.reduce((s, it) => s += it.content, '');
      return str;
    }, '');
  }

  if (packLink)
    return {
      link: packLink.target,
      type: packLink.type,
      name: packLink.content.reduce(cancatContent, ''),
      content: content,
    };
}

function getBody(body) {
  if (body.items) {
    return body.items.map((pack) => {
      // sublist
      if (pack.length && pack[0].type == 'text' && IsList(pack[pack.length - 1])) {
        // console.log(pack);
        let content = pack.reduce( (str, it) => {
          if (it.type == 'text')
            str += it.content;
          return str;
        }, '');
        return {
          name: content.trim(),
          type: pack[pack.length - 1].type,
          list: pack[pack.length - 1].items.map(p => {
            if (p.length && p[0].type == 'link')
            return getLink(p);
          }),
        };
      } else if (pack.length && pack[0].type == 'link') {
        return getLink(pack);
      }
    });
  }
}

function findBodyLists(list, synTree) {
  // find list in tree
  if (!utils.isIterable(list))
    return;
  list = list.map((p) => {
    console.log('part length: ', p.part.length);
    let index = p.index;
    p.part = p.part.map(ch => {
      if (!ch.length || !ch[0] || ch[0].type !== 'link')
        next;
      let target = ch[0].content.reduce(cancatContent, '');
      let newChap = { name: target };
      for (let i = index; i < synTree.length; i++) {
        if (IsHead(synTree[i], 3) && IsLinkContent(synTree[i], target)) {
          index = i;
          let head = synTree[i];
          ++i;
          let body = synTree[i];
          console.log(target, body);
          if (body.type === 'list') {
            newChap.list = getBody(body);
          }
        }
      }

      return newChap;
    });
    return p;
  });
  console.log('list length: ', list.length);

  return list;
}

function expiredFile(fileName) {
  let bExpiredFile = true;
  try {
    let stat = fs.lstatSync(fileName);
    let intervalMs = Date.now() - stat.mtimeMs;
    let days = Math.floor(intervalMs / (1000 * 60 * 60 * 24));
    if (!days)
    bExpiredFile = false;
  } catch (e) {
    console.log('Error check expired file: ', e);
  }

  return bExpiredFile;
}

const repoInfo = [
  ['updated_at', 'date'],
  ['stargazers_count', 'star'],
];

async function getRepoInfo(pack) {
  let info;
  if (pack.type == 'link') {
    info = await repo.getGitHubInfo(pack.link);
    if (info && info.hasOwnProperty('data')) {
      info = getProperty(info.data, repoInfo);
      console.log(info);
      pack.info = info;
    }
  } else if (pack.type == 'list') {
    pack.list = pack.list.map(async p => {
      info = await repo.getGitHubInfo(p.link);
      if (info && info.hasOwnProperty('data')) {
        info = getProperty(info.data, repoInfo);
        console.log(info);
        pack.info = info;
      }
    });
  }

}

async function getAllGitHubInfo(bodyList) {
  let index = 0;
  for (let chapter of bodyList) {
    for (let part of chapter.part) {
      for (let pack of part.list) {
        index++;
        console.log('index ', index);
        // await getRepoInfo(pack);
      }
    }
  }

  console.log('Get all github info');
  return bodyList;
}
