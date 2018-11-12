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

  getAllPages(count = 30) {
    this.init();
    let packages = pageSlice(this.packages, count);
    if (packages) {
      return packages;
    } else {
      return 'Not parse data';
    }
  }

  filterPages(filterNum, count = 30) {
    console.log('filter', filterNum);
    this.init();
    let data = this.getRepoDataByFilter(filterNum);
    if (data) {
      let packages = pageSlice(data, count);
      if (packages) {
        return packages;
      } else {
        return 'Not parse data';
      }
    }
  }

  // filter
  getRepoDataByFilter(filter) {
    if (!this.packages || !filter)
      return;
    let filterPackages = [];

    // get packages
    let IsStar = (pack, filter) => pack.info
    && pack.info.star && pack.info.star >= filter;

    let packages = this.packages;
    if (packages) {
      filterPackages = packages.filter(chapter => {
        chapter.list = chapter.list.filter(pack => {
          if (pack.type == 'link' && IsStar(pack, filter))
            return pack;
          else if (pack.type == 'list') {
            pack.list = pack.list.filter(subpack => {
              if (subpack.type == 'link' && IsStar(subpack, filter))
                return subpack;
            });
            if (pack.list.length)
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
    if (!this.mutex) {
      this.mutex = 1;
      this.data = await parser();
      this.mutex = 0;
    } else {
      return;
    }
    if (!this.data)
      return;
    fs.writeFile(this.fileName, JSON.stringify(this.data), (err) => {
      if (err) throw err;
      console.log('The file had been saved!');
    });
  }

  init() {
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
        this.packages = this.data[0].part;
      }
    });
  }

};
