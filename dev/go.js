/**
 * Ancient @izs magic to run a bunch of servers in child processes neatly.
 */

var touch = require('touch')
var spawn = require('child_process').spawn
var once = require('once')

// flow control is fun!
function queue () {
  var args = [].slice.call(arguments)
  var cb = args.pop()
  go(args.shift())
  function go (fn) {
    if (!fn) return cb()
    fn(function (er) {
      if (er) return cb(er)
      go(args.shift())
    })
  }
}

var children = []
function exec (cmd, args, wait, cb) {
  console.log("Running %j %j",cmd,args)
  if (typeof wait === 'function') cb = wait, wait = 200
  cb = once(cb)

  var opts = {stdio:'inherit'}
  // windows is kind of a jerk sometimes.
  if (process.platform === 'win32') {
    args = ['/c', '"' + cmd + '"'].concat(args)
    cmd = 'cmd'
    opts.windowsVerbatimArguments = true
  }
  var child = spawn(cmd, args, opts)

  var timer = setTimeout(cb, wait)

  child.on('exit', function (code) {
    clearTimeout(timer)
    var er
    if (code) {
      msg = cmd + ' ' + args.join(' ') + ' fell over: '+code
      console.error(msg)
      er = new Error(msg)
    }
    cb(er)
  })
  children.push(child)
}

// try to shut down stuff nicely on ctrl-C
process.on('exit', function() {
  children.forEach(function(child) {
    try {
      child.kill('SIGKILL')
    } catch (er) {}
  })
})

queue(function (cb) {
  // first, make sure that we have the databases, or replicate will fail
  touch('dev/couch/registry.couch', cb)

}, function (cb) {
  touch('dev/couch/public_users.couch', cb)

}, function (cb) {
  touch('dev/couch/downloads.couch', cb)

}, function (cb) {
  // start elasticsearch
  exec('elasticsearch', [
    '-Des.config=dev/elasticsearch/elasticsearch.yml'
    , '-f'
  ], 5000, cb)

}, function (cb) {
  // spawn couchdb, and make sure it stays up for a little bit
  exec('couchdb', ['-a', 'dev/couch/couch.ini'], cb)

}, function (cb) {
  // do the same for redis.
  exec('redis-server', ['dev/redis/redis.conf'], cb)

}, function (cb) {
  // wait 10 seconds for couch to start and download some data
  // otherwise the site is pretty empty.
  setTimeout(function() {
    exec(process.execPath, [require.resolve('./replicate.js')], 5000, cb)
  },10000)

}, function (cb) {
  // by now, elastic search is probably up
  exec(process.execPath, [
    './node_modules/npm2es/bin/npm2es.js'
    , '--couch=http://localhost:15984/registry'
    , '--es=http://127.0.0.1:9200/npm'
  ], function (code) {
    console.error('did npm2es', code)
    cb(code)
  })

}, function(er) {
  if(er) throw er
})
