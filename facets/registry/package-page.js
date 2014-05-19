var Hapi = require('hapi'),
    marked = require('marked'),
    sanitizer = require('sanitizer'),
    gravatar = require('gravatar').url,
    moment = require('moment'),
    url = require('url'),
    ghurl = require('github-url-from-git');
// , metrics = require('../metrics-client.js')()


module.exports = function (request, reply) {
  var getPackageFromCouch = request.server.methods.getPackageFromCouch;

  var nameInfo = parseName(request.params.package)

  if (nameInfo.name !== encodeURIComponent(nameInfo.name)) {
    return reply(new Error('invalid package name'))
  }

  getPackageFromCouch(couchLookupName(nameInfo), function (er, data) {
    if (er || data.error) { // user probably isn't logged in
      var error = Hapi.error.notFound(er || data.message);

      reply(error)
    }

    preparePackageForViewing(data, function (er, data) {
      reply.view('package-page', {
        package: data
      });
    })
  })
}

function parseName (params) {
  var name, version;

  if (typeof params === 'object') {
    name = params.name;
    version = params.version;
  } else {
    var p = params.split('@');
    name = p.shift();
    version = p.join('@');
  }

  version = version || '';

  return {name: name, version: version};
}

function couchLookupName (nameInfo) {
  var name = nameInfo.name;

  if (nameInfo.version) {
    name += '/' + version;
  }

  return name;
}

function preparePackageForViewing (data, cb) {
  data.starredBy = Object.keys(data.users || {}).sort()
  var len = data.starredBy.length

  if (data.time && data['dist-tags']) {
    var v = data['dist-tags'].latest
    var t = data.time[v]
    if (!data.versions[v]) {
      console.error('invalid package data: %s', data._id)
      return cb(new Error('invalid package: '+ data._id))
    }
    data.version = v
    // check to see if there's a newer version of the readme than
    // the one in the latest package
    if (data.versions[v].readme && data.time[v] === data.time.modified) {
      data.readme = data.versions[v].readme
      data.readmeSrc = null
    }
    data.fromNow = moment(t).fromNow()
    data._npmUser = data.versions[v]._npmUser || null

    // check if publisher is in maintainers list
    data.publisherIsInMaintainersList = isPubInMaint(data)

    setLicense(data, v)
  }

  if (data.time && data.time.unpublished) {
    var t = data.time.unpublished.time
    data.unpubFromNow = moment(t)
  }

  if (data.homepage && typeof data.homepage !== 'string') {
    if (Array.isArray(data.homepage))
      data.homepage = data.homepage[0]
    if (typeof data.homepage !== 'string')
      delete data.homepage
  }

  if (data.readme && !data.readmeSrc) {
    data.readmeSrc = data.readme
    data.readme = parseReadme(data)
  }
  gravatarPeople(data)

  return cb(null, data);
}

function urlPolicy (pkgData) {
  var gh = pkgData && pkgData.repository ? ghurl(pkgData.repository.url) : null
  return function (u) {
    if (u.scheme_ === null && u.domain_ === null) {
      if (!gh) return null
      // temporary fix for relative links in github readmes, until a more general fix is needed
      var v = url.parse(gh)
      if (u.path_) { v.pathname = v.pathname + '/blob/master/' + u.path_}
      u = {
        protocol: v.protocol,
        host: v.host,
        pathname: v.pathname,
        query: u.query_,
        hash: u.fragment_
      }
    } else {
      u = {
        protocol: u.scheme_ + ':',
        host: u.domain_ + (u.port_ ? ':' + u.port_ : ''),
        pathname: u.path_,
        query: u.query_,
        hash: u.fragment_
      }
    }
    u = url.parse(url.format(u))
    if (!u) return null
    if (u.protocol === 'http:' &&
        (u.hostname && u.hostname.match(/gravatar.com$/))) {
      // use encrypted gravatars
      return url.format('https://secure.gravatar.com' + u.pathname)
    }
    return url.format(u)
  }
}

function parseReadme (data) {
  var p
  if (typeof data.readmeFilename !== 'string' ||
      (data.readmeFilename.match(/\.(m?a?r?k?d?o?w?n?)$/i) &&
       !data.readmeFilename.match(/\.$/))) {
    try {
      p = marked.parse(data.readme)
    } catch (er) {
      return 'error parsing readme'
    }
    p = p.replace(/<([a-zA-Z]+)([^>]*)\/>/g, '<$1$2></$1>')
  } else {
    var p = data.readme
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
    p = '<pre>' + sanitizer.sanitize(p, urlPolicy(p)) + '</pre>'
  }
  return sanitizer.sanitize(p, urlPolicy(data))
}

function isPubInMaint (data) {
  if (data.maintainers && data._npmUser) {
    for (var i = 0; i < data.maintainers.length; i++) {
      if (data.maintainers[i].name === data._npmUser.name) {
        return true
      }
    }
  }

  return false
}

function gravatarPeople (data) {
  gravatarPerson(data.author)

  if (data._npmUser) gravatarPerson(data._npmUser)

  if (data.maintainers) data.maintainers.forEach(function (m) {
    gravatarPerson(m)
  })
  if (Array.isArray(data.contributors)) {
    data.contributors.forEach(function (m) {
      gravatarPerson(m)
    })
  }
}

function setLicense (data, v) {
  var latestInfo = data.versions[v], license

  if (latestInfo.license)
    license = latestInfo.license
  else if (latestInfo.licenses)
    license = latestInfo.licenses
  else if (latestInfo.licence)
    license = latestInfo.licence
  else if (latestInfo.licences)
    license = latestInfo.licences
  else
    return

  data.license = {}

  if (Array.isArray(license)) license = license[0]

  if (typeof license === 'object') {
    if (license.type) data.license.name = license.type
    if (license.name) data.license.name = license.name
    if (license.url) data.license.url = license.url
  }

  if (typeof license === 'string') {
    var parsedLicense = url.parse(license)
    if (parsedLicense && parsedLicense.protocol && parsedLicense.protocol.match(/^https?:$/)) {
      data.license.url = data.license.type = parsedLicense.href
    } else {
      data.license.url = getOssLicenseUrlFromName(license)
      data.license.name = license
    }
  }
}

function getOssLicenseUrlFromName (name) {
  var base = 'http://opensource.org/licenses/'

  var licenseMap = {
    'bsd': 'BSD-2-Clause',
    'mit': 'MIT',
    'x11': 'MIT',
    'mit/x11': 'MIT',
    'apache 2.0': 'Apache-2.0',
    'apache2': 'Apache-2.0',
    'apache 2': 'Apache-2.0',
    'apache-2': 'Apache-2.0',
    'apache': 'Apache-2.0',
    'gpl': 'GPL-3.0',
    'gplv3': 'GPL-3.0',
    'gplv2': 'GPL-2.0',
    'gpl3': 'GPL-3.0',
    'gpl2': 'GPL-2.0',
    'lgpl': 'LGPL-2.1',
    'lgplv2.1': 'LGPL-2.1',
    'lgplv2': 'LGPL-2.1'
  }

  return licenseMap[name.toLowerCase()]
         ? base + licenseMap[name.toLowerCase()]
         : base + name
}

function gravatarPerson (p) {
  if (!p || typeof p !== 'object') {
    return
  }
  p.avatar = gravatar(p.email || '', {s:50, d:'retro'}, true)
  p.avatarMedium = gravatar(p.email || '', {s:100, d:'retro'}, true)
  p.avatarLarge = gravatar(p.email || '', {s:496, d:'retro'}, true)
}
