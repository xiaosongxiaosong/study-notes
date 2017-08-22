const fs = require('fs');
const path = require('path');

const excludePath = ['public', 'node_modules', 'test', '.git', 'demo', '.vscode'];
const excludeFile = ['README.md', 'readmefile.md', 'SUMMARY.md'];
const indexFileName = 'SUMMARY.md';

const inArray = (str, list) => {
  const index = list.find((it) => {
    return it === str;
  });
  // console.log(index);
  if (undefined !== index) {
    return -1;
  } else {
    return index;
  }
};

const readme = (rootpath, title) => {
  const readmepath = path.join(rootpath, indexFileName);
  const fd = fs.openSync(readmepath, 'w');
  fs.writeSync(fd, `# ${title}\r\n\r\n`);

  let tableOfContents = '';
  const files = fs.readdirSync(rootpath);
  files.forEach((file) => {
    const index = excludePath.find((it) => {
      return it === file;
    });
    // console.log(index);
    if (undefined !== index) {
      return null;
    }
    const filepath = path.join(rootpath, file);
    const stats = fs.lstatSync(filepath);
    if (true === stats.isDirectory()) {
      if (-1 !== inArray(filepath, excludePath)) {
        const childTOC = readme(path.join(rootpath, file), file).split('\r\n').map((it) => {
          return `  ${it}`;
        }).join('\r\n');
        const link = path.join(rootpath, file, indexFileName);
        tableOfContents += `* [${file}](${link})\r\n${childTOC}\r\n`;
        // tableOfContents += childTOC;
      } else {
        console.log(file);
      }
    } else {
      if (-1 !== inArray(file, excludeFile)) {
        if (-1 !== file.search(/\.md$/)) {
          const link = path.join(rootpath, file);
          tableOfContents += `* [${file}](${link})\r\n`;
        } else {
          console.log(file);
        }
      }
    }
  });

  fs.writeSync(fd, tableOfContents);
  fs.close(fd, (err) => {
    if (err) {
      return console.error(err);
    }
  });

  return tableOfContents;
};
readme('.', 'study-notes');


