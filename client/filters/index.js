var skipPreCode = require('./filterUtils').makeSkipCodeAndPreformatted

module.exports = [
  require('./escapeFilter.js'),
  require('./youtubeFilter.js'),
  require('./vimeoFilter.js'),
  require('./markdownFilter.js'),
  skipPreCode(require('./skypeEmoticonsFilter.js')),
  skipPreCode(require('./emojiFilter.js'))
]
