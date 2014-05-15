module.exports = function packageKeywords (keywords) {
  if (typeof keywords === 'string') {
    keywords = keywords.split(/\s*,?\s*/)
  }

  if (Array.isArray(keywords)) {
    keywords = keywords.map(function (kw) {
      kw = kw.replace(/</g, '&lt;').replace(/"/g, '&quot;')
            return '<a href="/browse/keyword/' + kw + '">' + kw + '</a>'
      }).join(', ')
  }

  return keywords;
}