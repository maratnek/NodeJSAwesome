const page = require('./page');
const fs = require('fs');
const parser = require('./markdown');
const packDeepSlice = page.packDeepSlice;
const pageSlice = page.pageSlice;

function expiredFile(fileName) {
  let bExpiredFile = true;
  try {
    let stat = fs.lstatSync(fileName);
    let intervalMs = Date.now() - stat.mtimeMs;
    let days = Math.floor( intervalMs / (1000*60*60*24) );
    if (!days)
    bExpiredFile = false;
  } catch (e) {
    console.log('Error check expired file: ', e);
  }
  return bExpiredFile;
}


module.exports = class ParserNodeAwesome {
  constructor() {
    this.fileName = 'node-awesome.json';
    this.data = null;
    this.init();
    if (this.data)
      console.log('Packages: ', this.data[0].name);
    console.log('Constructor INIT');
  }

  filterPages(filterNum, count = 30) {
    console.log('filter', filterNum);
    let data = this.getRepoDataByFilter(filterNum);
    if (data) {
      console.log(data);
      let packages = pageSlice(data, count);
      if (packages) {
        return packages;
      } else {
        return 'Not parse data';
      }
    }
  }

  getAllPages(count = 30) {
    console.log(this.packages);
    let packages = pageSlice(this.packages, count);
    if (packages) {
      return packages;
    } else {
      return 'Not parse data';
    }
  }

  // filter
  getRepoDataByFilter(filter) {
    if (!this.data || !filter)
      return;
    let filterPackages = [];

    // get packages
    let packages = this.data[0].packages;
    let IsStar = (pack, filter) => pack.property
    && pack.property.star && pack.property.star >= filter;

    if (packages) {
      filterPackages = packages.filter(chapter => {
        chapter.list = chapter.list.filter(pack => {
          if (pack.type == 'link' && IsStar(pack, filter))
            return pack;
          else if (pack.type == 'list') {
            pack.list = pack.list.filter(subpack => {
              return subpack.type == 'link' && IsStar(subpack, filter);
            });
            return pack;
          }
        });
        if (chapter.list.length)
          return chapter;
      });
    }

    return filterPackages;
  }

  //
  async updateData() {
    this.data = await parser();
    if (!this.data)
      return;
    fs.writeFile(this.fileName, JSON.stringify(this.data), (err) => {
      if (err) throw err;
      console.log('The file had been saved!');
    });
  }

  init() {
    parser();
    fs.readFile(this.fileName, async (err, data) => {
      if (err) {
        await this.updateData();
      } else {
        let fileName = this.fileName;
        if (expiredFile(fileName))
          this.updateData();
        console.log('Parse JSON data');
        this.data = JSON.parse(data);
      }
      // Init packages
      if (this.data && this.data.length) {
        // console.log('Packages init: ', JSON.stringify(this.data,null,2));
        this.packages = this.data[0].part;
      }
    });
  }

};
