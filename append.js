const fs = require('fs');

let jsonParsed = JSON.parse(fs.readFileSync('./quotes.json'));

const jsonArray = Object.values(jsonParsed);

jsonArray.push([`${process.argv[2]}`, new Date()]);

fs.writeFileSync('./quotes.json', JSON.stringify(jsonArray), 'utf8');