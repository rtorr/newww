var qs = require('querystring')

var viewNames = {
  all: 'browseAll',
  keyword: 'byKeyword',
  updated: 'browseUpdated',
  author: 'browseAuthors',
  depended: 'dependedUpon',
  star: 'browseStarPackage',
  userstar: 'browseStarUser'
}

// the group level when there's no arg
var groupLevel = {
  all: 2,
  keyword: 1,
  author: 1,
  updated: 3,
  depended: 1,
  star: 2,
  userstar: 1
}

// the group level when there's an arg
var groupLevelArg = {
  keyword: 3,
  author: 3,
  depended: 3,
  star: 3,
  userstar: 3
}

module.exports = function (couchapp) {
  return function (type, arg, skip, limit, next) {
    var key = [type, arg, skip, limit].join(',')

    var u = '/registry/_design/app/_view/' + viewNames[type]
    var query = {}
    query.group_level = (arg ? groupLevelArg : groupLevel)[type]
    if (arg) {
      query.startkey = JSON.stringify([arg])
      query.endkey = JSON.stringify([arg, {}])
    }

    // if it normally has an arg, but not today,
    // fetch everything, and sort in descending order by value
    // manually, since couchdb can't do this.
    // otherwise, just fetch paginatedly
    if (arg || !transformKeyArg[type]) {
      query.skip = skip
      query.limit = limit
    }

    if (type === 'updated') query.descending = true

    // We are always ok with getting stale data, rather than wait for
    // couch to generate new view data.
    query.stale = 'update_after'

    u += '?' + qs.stringify(query)

    // var timing = {}
    // timing.start = Date.now()

    couchapp.get(u, function (er, cr, data) {

      // timing.end = Date.now()
      // metrics.histogram('registry-latency>browse|' + type + '|' + arg, timing.end - timing.start)

      if (data) {
        data = transform(type, arg, data, skip, limit)
      }
      if (er) {
        console.error("Error fetching browse data", er)
        data = []
        er = null
      }
      next(er, data)
    })
  }
}


var transformKey = {
  all: function (k, v) { return {
    name: k[0],
    description: k[1],
    url: '/package/' + k[0],
    value: v
  }},

  updated: function (k, v) { return {
    name: k[1],
    description: k[2] + ' - ' + k[0].substr(0, 10),
    url: '/package/' + k[1],
    value: k[0]
  }},

  keyword: tk,
  author: tk,
  depended: tk,

  // usernames should always link to a profile, and
  // package names should always link to a package.
  userstar: function (k, v, type) { return {
    name: k[0],
    description: v + ' packages',
    url: '/profile/' + k[0],
    value: v
  }},
  star: function (k, v, type) { return {
    name: k[0],
    description: k[1] + ' - ' + v,
    url: '/package/' + k[0],
    value: v
  }}
}

function tk (k, v, type) { return {
  name: k[0],
  description: v + ' packages',
  url: '/browse/' + type + '/' + k[0],
  value: v
}}

var transformKeyArg = {
  keyword: tka,
  author: tka,
  depended: tka,
  userstar: tka,
  star: function (k, v) { return {
    name: k[2],
    description: '',
    url: '/profile/' + k[2]
  }}
}

function tka (k, v) { return {
  name: k[1],
  description: k[2] || '',
  url: '/package/' + k[1]
}}

function transform (type, arg, data, skip, limit) {
  if (!data.rows) {
    console.warn('no rows?', type, arg, data, skip, limit)
    return []
  }

  data = data.rows.map(function (row) {
    var fn = (arg ? transformKeyArg : transformKey)[type]
    return fn(row.key, row.value, type)
  })

  // normally has an arg.  sort, and then manually paginate.
  if (!arg && transformKeyArg[type]) {
    data = data.sort(function (a, b) {
      return a.value === b.value ? (
        a.name === b.name ? 0 : a.name < b.name ? -1 : 1
      ) : a.value > b.value ? -1 : 1
    }).slice(skip, skip + limit)
  }

  return data
}


