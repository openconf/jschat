var skipPreCode = require('./filterUtils').makeSkipCodeAndPreformatted

module.exports = [
  require('./escapeFilter'),
  require('./youtubeFilter'),
  require('./vimeoFilter'),
  require('./markdownFilter'),
  skipPreCode(require('./skypeEmoticonsFilter')),
  skipPreCode(require('./emojiFilter'))
]
