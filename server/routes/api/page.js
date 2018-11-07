
const assert = require('assert');

// Test data
let testData = [
  {
    name: 'name1',
    list: [
      { name: 'pack1', type: 'link' },
      { name: 'subhead1', type: 'list',
      list: [
        { name: 'pack2', type: 'link' },
        { name: 'pack3', type: 'link' },
        { name: 'pack4', type: 'link' },
      ],
    },
    ],
  },
  {
    name: 'name2',
    list: [
      { name: 'pack5', type: 'link' },
      { name: 'pack6', type: 'link' },
      { name: 'pack7', type: 'link' },
      { name: 'pack8', type: 'link' },
      { name: 'pack9', type: 'link' },
      { name: 'pack10', type: 'link' },
      { name: 'pack11', type: 'link' },
    ],
  },
];

function packDeepLength(body) {
  let length = 0;
  for (let pack of body.list) {
    if (pack.type == 'link') {
      ++length;
    } else if (pack.type == 'list') {
      length += pack.list.length;
    }
  }

  return length;
}

try {
  assert.equal(packDeepLength(testData[0]), 4, 'Test deep length');
  console.log('Test deep length OK');
} catch (e) {
  console.log('Test deep length ERROR');
}

function pageLength(page) {
  return page.reduce((sum, body) => {
    return sum += packDeepLength(body);
  }, 0);
};

try {
  assert.equal(pageLength(testData), 11, 'Test page length');
  console.log('Test page length OK');
} catch (e) {
  console.log('Test page length ERROR');
}

function sanitizeForward(object, key) {
  return Object.keys(object)
  .filter(k => k != key)
  .reduce((obj, key) => {
    obj[key] = object[key];
    return obj;
  }, {});
}

try {
  let sanData = sanitizeForward({ body: 'body', list: 'list' }, 'list');
  assert.deepEqual(sanData, { body: 'body' }, 'Test sanitize');
  console.log('Test sanitize OK', sanData);
} catch (e) {
  console.log('Test sanitize ERROR');
}

function getChunk(chapter, size) {
  let body = sanitizeForward(chapter, 'list');
  let b1 = Object.assign({}, body);
  let b2 = Object.assign({}, body);
  b1.list = chapter.list.slice(0, size);
  b2.list = chapter.list.slice(size, chapter.list.length);
  return [b1, b2];
}

try {
  let t1 = { body: 'body', list: [
      { name: 'name1', type: 'link' },
      { name: 'name2', type: 'link' },
      { name: 'name3', type: 'link' },]};
  let t2 = { body: 'body', list: [
      { name: 'name4', type: 'link' },
      { name: 'name5', type: 'link' },]};
  let data = { body: 'body', list: [
      { name: 'name1', type: 'link' },
      { name: 'name2', type: 'link' },
      { name: 'name3', type: 'link' },
      { name: 'name4', type: 'link' },
      { name: 'name5', type: 'link' },]};
  let chunk = getChunk(data, 3);
  // console.log(chunk[0], chunk[1]);
  assert.deepEqual(chunk[0], t1, 'Test chunk');
  assert.deepEqual(chunk[1], t2, 'Test chunk');
  console.log('Test chunk OK');
} catch (e) {
  console.log('Test chunk ERROR', e);
}

function getDeepChunk(chapter, size) {
  let body = sanitizeForward(chapter, 'list');
  let b1 = Object.assign({}, body);
  let b2 = Object.assign({}, body);
  let length = 0;
  // console.log(chapter, size);
  for (let [i, pack] of chapter.list.entries()) {
    if (pack.type == 'link') {
      ++length;
    } else if (pack.type == 'list') {
      length += pack.list.length;
    }

    if (length == size) {
      b1.list = chapter.list.slice(0, i + 1);
      b2.list = chapter.list.slice(i + 1, chapter.list.length);
      // console.log('b1',b1);
      // console.log('b2',b2);
      return [b1, b2];
    } else if (length > size) {
      let s = pack.list.length;
      let r = length - size;
      let ch = getChunk(pack, s - r);
      b1.list = chapter.list.slice(0, i);
      b1.list.push(ch[0]);
      b2.list = chapter.list.slice(i + 1, chapter.list.length);
      b2.list.unshift(ch[1]);
      // console.log('b1',b1);
      // console.log('b2',b2);
      return [b1, b2];
    }
  }
}

try {
  let t1 = { body: 'body', list: [
      { name: 'name1', type: 'link' },
      { name: 'subhead', type: 'list', list: [
        { name: 'name2', type: 'link' },
        { name: 'name3', type: 'link' },
      ]},
    ]};
  let t2 = { body: 'body', list: [
      { name: 'subhead', type: 'list', list: [
        { name: 'name4', type: 'link' },
        { name: 'name5', type: 'link' },
      ]},
      { name: 'name6', type: 'link' },
    ]};
  let data = { body: 'body', list: [
      { name: 'name1', type: 'link' },
      { name: 'subhead', type: 'list', list: [
        { name: 'name2', type: 'link' },
        { name: 'name3', type: 'link' },
        { name: 'name4', type: 'link' },
        { name: 'name5', type: 'link' },
      ] },
      { name: 'name6', type: 'link' },
    ]};
  let chunk = getDeepChunk(data, 3);
  // console.log(chunk[0], chunk[1]);
  assert.deepEqual(chunk[0], t1, 'Test deep chunk');
  console.log('Test deep chunk OK');
  assert.deepEqual(chunk[1], t2, 'Test deep chunk');
  console.log('Test deep chunk OK');
} catch (e) {
  console.log('Test deep chunk ERROR', e);
  console.log(e.actual, e.expected);
}


function packDeepSlice(chapter, size) {
  let packages = [];
  let body = sanitizeForward(chapter, 'list');
  let len = packDeepLength(chapter);
  // console.log('len ', len);
  // console.log(chapter);
  for (let i = size, j = len; i < j; i += size) {
    // console.log('Deep slice', i);
    // console.log('push');
    chapter = getDeepChunk(chapter, size);
    packages.push(chapter[0]);
    chapter = chapter[1];
  }
  if (chapter && chapter.list.length) {
    packages.push(chapter);
  }
  // console.log('end ',packages);
  // console.log(ch);
  // for (let i = 0, j = len; i < j; i += size) {
  //   let b = Object.assign({}, body);
  //   b.list = pack.list.slice(i, i + size);
  //   packages.push(b);
  // }
  //
  // let length = 0;
  // // for (let [i, pack] of chapter.list.entries()) {
  // for (let i = 0, j = len; i < j; i += size) {
  //   let b = Object.assign({}, body);
  //   if (pack.type == 'link') {
  //     ++length;
  //   } else if (pack.type == 'list') {
  //     length += pack.list.length;
  //   }
  //
  //   if (length == size) {
  //     b1.list = chapter.list.slice(0, i + 1);
  //     b2.list = chapter.list.slice(i + 1, chapter.list.length);
  //     return [b1, b2];
  //   } else if (length > size) {
  //     let s = pack.list.length;
  //     let r = length - size;
  //     let ch = getChunk(pack, s - r);
  //     b1.list = chapter.list.slice(0, i);
  //     b1.list.push(ch[0]);
  //     b2.list = chapter.list.slice(i + 1, chapter.list.length);
  //     b2.list.unshift(ch[1]);
  //     return [b1, b2];
  //   }
  // }
  //
  return packages;
}

try {
  let t = [
  { body: 'body', list: [
    { name: 'name1', type: 'link' },
    { name: 'subhead1', type: 'list', list: [
      { name: 'name2', type: 'link' },
      { name: 'name3', type: 'link' },
    ]},
  ]},
  { body: 'body', list: [
    { name: 'subhead1', type: 'list', list: [
      { name: 'name4', type: 'link' },
      { name: 'name5', type: 'link' },
    ]},
    { name: 'name6', type: 'link' },
  ]},
  { body: 'body', list: [
    { name: 'subhead2', type: 'list', list: [
      { name: 'name7', type: 'link' },
      { name: 'name8', type: 'link' },
      { name: 'name9', type: 'link' },
    ] },
  ]},
  { body: 'body', list: [
    { name: 'name10', type: 'link' },
  ]},
];
let data = { body: 'body', list: [
  { name: 'name1', type: 'link' },
  { name: 'subhead1', type: 'list', list: [
    { name: 'name2', type: 'link' },
    { name: 'name3', type: 'link' },
    { name: 'name4', type: 'link' },
    { name: 'name5', type: 'link' },
  ] },
  { name: 'name6', type: 'link' },
  { name: 'subhead2', type: 'list', list: [
    { name: 'name7', type: 'link' },
    { name: 'name8', type: 'link' },
    { name: 'name9', type: 'link' },
  ] },
  { name: 'name10', type: 'link' },
]};
  console.log('DeepSlice');
  let slice = packDeepSlice(data, 3);

  for (let [i, pack] of slice.entries()) {
    // console.log(pack, t[i]);
    assert.deepEqual(pack, t[i], 'Test deep slice');
    console.log('Test deep slice OK');
  }
} catch (e) {
  console.log('Test deep slice ERROR', e);
  console.log(e.actual, e.expected);
}

function pageSlice(packages, count) {
  console.log('Page By ', count);
  if (!packages || !packages.length || count == 0)
    return;
  let book = [];
  let page = [];
  for (let [i, pack] of packages.entries()) {
    if (packDeepLength(pack) < count - pageLength(page)) {
      page.push(pack);
    } else if (packDeepLength(pack) > count - pageLength(page)) {
      let chunk = getDeepChunk(pack, count - pageLength(page));
      page.push(chunk[0]);
      book.push(page);
      page = [];
      if (packDeepLength(chunk[1]) > count) {
        let packS = packDeepSlice(chunk[1], count);
        for (let it of packS) {
          if (packDeepLength(it) == count) {
            book.push([it]);
          } else {
            page.push(it);
          }
        }
      } else if (packDeepLength(chunk[1]) < count) {
        page.push(chunk[1]);
      } else {
        book.push(chunk[1]);
      }
    } else {
      page.push(pack);
      book.push(page);
      page = [];
    }
  }

  if (page.length) {
    book.push(page);
  }

  return book;
}

// page slice test
try {
  let chapters = [
    {
      name: 'name1',
      list: [
        { name: 'pack1', type: 'link' },
        { name: 'subhead1', type: 'list',
        list: [
          { name: 'pack2', type: 'link' },
          { name: 'pack3', type: 'link' },
          { name: 'pack4', type: 'link' },
        ]},
      ],
    },
    {
      name: 'name2',
      list: [
        {name: 'pack5', type: 'link'},
        {name: 'pack6', type: 'link'},
        {name: 'pack7', type: 'link'},
        {name: 'pack8', type: 'link'},
        {name: 'pack9', type: 'link'},
        {name: 'pack10', type: 'link'},
        {name: 'pack11', type: 'link'},
      ],
    },
    {
      name: 'name3',
      list: [
        {name: 'pack12', type: 'link'},
        {name: 'pack13', type: 'link'},
        {name: 'pack14', type: 'link'},
      ],
    },
    {
      name: 'name4',
      list: [
        { name: 'subhead1', type: 'list',
        list: [
          { name: 'pack15', type: 'link' },
          { name: 'pack16', type: 'link' },
          { name: 'pack17', type: 'link' },
          { name: 'pack18', type: 'link' },
        ]},
        { name: 'subhead2', type: 'list',
        list: [
          { name: 'pack19', type: 'link' },
          { name: 'pack20', type: 'link' },
        ]},
        { name: 'subhead3', type: 'list',
        list: [
          { name: 'pack21', type: 'link' },
          { name: 'pack22', type: 'link' },
          { name: 'pack23', type: 'link' },
          { name: 'pack24', type: 'link' },
          { name: 'pack25', type: 'link' },
          { name: 'pack26', type: 'link' },
        ]},
      ],
    },
    {
      name: 'name5',
      list: [
        {name: 'pack27', type: 'link'},
        {name: 'pack28', type: 'link'},
        {name: 'pack29', type: 'link'},
        {name: 'pack30', type: 'link'},
      ],
    },
  ];

  let pages = [
  [ // page  1
    {
      "name": "name1",
      "list": [
        {
          "name": "pack1",
          "type": "link"
        },
        {
          "name": "subhead1",
          "type": "list",
          "list": [
            {
              "name": "pack2",
              "type": "link"
            },
            {
              "name": "pack3",
              "type": "link"
            },
            {
              "name": "pack4",
              "type": "link"
            }
          ]
        }
      ]
    },
    {
      "name": "name2",
      "list": [
        {
          "name": "pack5",
          "type": "link"
        }
      ]
    }
  ]
  ,[// page  2
    {
      "name": "name2",
      "list": [
        {
          "name": "pack6",
          "type": "link"
        },
        {
          "name": "pack7",
          "type": "link"
        },
        {
          "name": "pack8",
          "type": "link"
        },
        {
          "name": "pack9",
          "type": "link"
        },
        {
          "name": "pack10",
          "type": "link"
        }
      ]
    }
  ]
  ,[// page  3
    {
      "name": "name2",
      "list": [
        {
          "name": "pack11",
          "type": "link"
        }
      ]
    },
    {
      "name": "name3",
      "list": [
        {
          "name": "pack12",
          "type": "link"
        },
        {
          "name": "pack13",
          "type": "link"
        },
        {
          "name": "pack14",
          "type": "link"
        }
      ]
    },
    {
      "name": "name4",
      "list": [
        {
          "name": "subhead1",
          "type": "list",
          "list": [
            {
              "name": "pack15",
              "type": "link"
            }
          ]
        }
      ]
    }
  ]
  ,[// page  4
    {
      "name": "name4",
      "list": [
        {
          "name": "subhead1",
          "type": "list",
          "list": [
            {
              "name": "pack16",
              "type": "link"
            },
            {
              "name": "pack17",
              "type": "link"
            },
            {
              "name": "pack18",
              "type": "link"
            }
          ]
        },
        {
          "name": "subhead2",
          "type": "list",
          "list": [
            {
              "name": "pack19",
              "type": "link"
            },
            {
              "name": "pack20",
              "type": "link"
            }
          ]
        }
      ]
    }
  ]
  ,[// page  5
    {
      "name": "name4",
      "list": [
        {
          "name": "subhead3",
          "type": "list",
          "list": [
            {
              "name": "pack21",
              "type": "link"
            },
            {
              "name": "pack22",
              "type": "link"
            },
            {
              "name": "pack23",
              "type": "link"
            },
            {
              "name": "pack24",
              "type": "link"
            },
            {
              "name": "pack25",
              "type": "link"
            }
          ]
        }
      ]
    }
  ],
  [//page 6
    {
      "name": "name4",
      "list": [
        {
          "name": "subhead3",
          "type": "list",
          "list": [
            {
              "name": "pack26",
              "type": "link"
            }
          ]
        }
      ]
    },
    {
      "name": "name5",
      "list": [
        {
          "name": "pack27",
          "type": "link"
        },
        {
          "name": "pack28",
          "type": "link"
        },
        {
          "name": "pack29",
          "type": "link"
        },
        {
          "name": "pack30",
          "type": "link"
        }
      ]
    }
  ]
];

  console.log('Page Slice');
  let book = pageSlice(chapters, 5);
  for (let [i, page] of book.entries()) {
    assert.deepEqual(page, pages[i]);
    console.log('Test page slice OK');
  }

  //// data test
  // packages = [
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

} catch (e) {
  console.log('Test page slice ERROR', e);
  console.log(e.actual, e.expected);
}

module.exports = {
  pageLength: pageLength,
  packDeepLength: packDeepLength,
  sanitizeForward: sanitizeForward,
  getChunk: getChunk,
  getDeepChunk: getDeepChunk,
  packDeepSlice: packDeepSlice,
  pageSlice: pageSlice,
};
