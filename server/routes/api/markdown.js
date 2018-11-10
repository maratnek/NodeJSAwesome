const repo = require('./repo.js');
const fs = require('fs');

const md = require('simple-markdown');
const mdParse = md.defaultBlockParse;


async function parse() {
  console.log('Parse');
  let request = await repo.getReadmeData();

  if (request.status != 200 || !request.data)
    return;

  let data = request.data;
  let result = mdParse(data);
  result = result.slice(1);
  fs.writeFileSync('file.json', JSON.stringify(result, null, 2));
  console.log('Analise data');
  await syntaxAnaliseMD(result);

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
  // console.log(synTree);
  let fullList = [];

  // synTree[0] --- heading2
  if (existContent(synTree[0])) {
    if (existList(synTree[1])) {
      let list = getListContent(synTree[1].items, synTree, 2);
      if (list) {
        let bodyList = findBodyLists(list, synTree);
        // console.log(JSON.stringify(bodyList, null, 2));
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
  if (!isIterable(list))
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

const repoInfo = [
  'updated_at',
  'stargazers_count',
];

async function getAllGitHubInfo(bodyList) {
  // get all GitHub info
  let index = 0;
  bodyList.map(chapter => chapter.part.map(part => part.list.map(async (pack) => {
    if (!pack)
    return;
    console.log('index', index++);
    // let rate = await repo.getRateLimit();
    if (true) {
      if (pack.type == 'link') {
        let info = await repo.getGitHubInfo(pack.link);
        if (info && info.hasOwnProperty('data')) {
          info = getProperty(info.data, repoInfo);
          console.log(info);
        }
      } else if (pack.type == 'list') {
        pack.list = pack.list.map(async p => {
          let info = await repo.getGitHubInfo(p.link);
          if (info && info.hasOwnProperty('data')) {
            info = getProperty(info.data, repoInfo);
            console.log(info);
          }
        });
      }
    } else {
        // wait
    }

  })));
  return;
}

parse();
