var request = require('request')

// first sync up the design docs, since this is the most important
// thing for the dev server starting up properly.
var ddocs =
  [ 'registry/_design/app',
    'registry/_design/scratch' ]

function replicateDdocs (callback) {
  var ddoc = ddocs.pop()
  if (!ddoc) {
    if (callback) callback()
    return
  }

  request({ url: 'https://aws-west-6.skimdb.internal.npmjs.com/' + ddoc, json: true }, then)
  function then (er, res, body) {
    if (er) throw er
    if (res.statusCode !== 200) {
      throw new Error('wtf?\n' + JSON.stringify([res.statusCode, body]))
    }
    request.put({ url: 'http://admin:admin@localhost:15984/' + ddoc +
                       '?new_edits=false', body: body, json: true }, then2)
  }
  function then2 (er, res, body) {
    if (er) throw er
    if (res.statusCode !== 201) {
      throw new Error('wtf?\n' + JSON.stringify([res.statusCode, body]))
    }
    console.error(body)
    replicateDdocs(callback)
  }
}

exports.replicateDdocs = replicateDdocs

if (module === require.main) {
  replicateDdocs()
}
