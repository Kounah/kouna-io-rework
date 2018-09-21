const process = require('process');

function rng() {
  return Math.trunc(Math.random() * 9.99999);
}

var storage = {};

while(true) {
  var random = rng();
  if(storage['' + random]) storage['' + random]++;
  else storage['' + random] = 1;
  var sum = 0;
  process.stdout.write('\r' + Object.keys(storage)
    .map(d => {
      sum += storage[d];
      return {
        key: d,
        value: storage[d]
      }
    })
    .sort((a, b) => {
      return a.key > b.key ? 1 : -1;
    })
    .map(d => {
      var res = (Math.round(d.value / sum * 10000) / 100)
      return `"${d.key}": ${' '.repeat(8 - ('' + d.value).length) + d.value} (${' '.repeat(6 - (res + '').length) + res}%)`;
    })
    .join(' ')
  );
}