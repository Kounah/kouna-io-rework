const config = require('../../config');

function yesNo(positiveCallback, negativeCallback, errorCallback) {
  return function(answer) {
    if(config.answers.yesNo.positive.includes(answer)) {
      positiveCallback();
    } else if(config.answers.yesNo.negative.includes(answer)) {
      negativeCallback();
    } else {
      errorCallback();
    }
  }
}

module.exports = {
  yesNo
}