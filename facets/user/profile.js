var gravatar = require('gravatar').url,
    sanitizer = require('sanitizer'),
    url = require('url');


exports.transform = function (data, profileFields) {
  if (!data || typeof data !== 'object') return data
  var d = Object.keys(data).reduce(function (s, k) {
    s[k] = data[k]
    return s
  }, {})

  var gr = d.email ? 'retro' : 'mm'
  d.avatar = gravatar(d.email || '', {s:50, d:gr}, true)
  d.avatarMedium = gravatar(d.email || '', {s:100, d:gr}, true)
  d.avatarLarge = gravatar(d.email || '', {s:496, d:gr}, true)

  if (d.github)
    d.github = d.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')

  //Template will append "@", make sure db entry is sent out clean.
  if (d.twitter)
    d.twitter = d.twitter.replace(/^@*(.*)/, '$1').replace(/^https?:\/\/twitter.com\//, '')

  d.fields = loadFields(d, profileFields)

  return d
}

function loadFields (profile, profileFields) {
  return Object.keys(profileFields).map(function (f) {
    var val = sanitizer.escape(profile[f] || '')
    var title = profileFields[f][0] || f
    var tpl = profileFields[f][1] || '%s'
    var show = val ? tpl.replace(/%s/g, val) : ''
    var urlTest = profileFields[f][2]
    show = show && sanitizer.sanitize(show, function (u) {
      if (!u.scheme_) return

      u = {
        protocol: u.scheme_ + ':',
        host: u.domain_ + (u.port_ ? ':' + u.port_ : ''),
        pathname: u.path_,
        query: u.query_,
        hash: u.fragment_
      }

      // special treatment for email addresses
      if (u.protocol === 'mailto:') u.host = ''

      u = url.parse(url.format(u))
      return (!u || !u.href || !urlTest || !urlTest(u)) ? '' : u.href
    }) || ''

    show = show.replace(/<a( rel="me")?>(.*?)<\/a>/, '$2')

    return {
      name: f,
      value: val,
      title: title,
      show: show
    }
  })
}
