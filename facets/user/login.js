var murmurhash = require('murmurhash');

module.exports = function login (request, reply) {
  var loginUser = request.server.methods.loginUser;

  if (request.auth.isAuthenticated) {
    return reply().redirect('/');
  }

  var opts = {};

  if (request.method === 'post') {

    if (!request.payload.name || !request.payload.password) {
      opts.message = 'Missing username or password';
    } else {
      loginUser(request.payload, function (er, user) {
        if (!user) {
          opts.message = 'Invalid username or password';

          reply.view('login', opts);
        }

        var sid = murmurhash.v3(user.name, 55).toString(16);

        user.sid = sid;

        request.server.app.cache.set(sid, user, 0, function (err) {
          if (err) {
            console.error("BOOM");
            reply(err);
          }

          request.auth.session.set({sid: sid});
          return reply().redirect('/');
        });
      })
    }
  }

  if (request.method === 'get' || opts.message) {
    // console.log(opts.message)
    return reply.view('login', opts)
  }


  // req.model.loadAs('whoshiring')
  // return req.session.get('auth', function (er, data) {
  //   if (data && !data.error) return res.redirect("/profile")

  //   // if ?done=/package/pkg - redirect to pkg after logging in
  //   if (req.query.done) req.session.set('done', req.query.done)

  //   req.model.load("profile", req);
  //   req.model.end(function(er, m) {
  //     // error just means we're not logged in.
  //     var locals = {
  //       profile: m && m.profile,
  //       hiring: req.model.whoshiring,
  //       error: null
  //     }

  //     res.template('login.ejs', locals)
  //   })
  // })
}


// module.exports = login
// var url = require("url")
//   , request = require("request")

// function login (req, res) {
//   req.model.loadAs('whoshiring')
//   switch (req.method) {
//     case 'POST': return handleForm(req, res)

//     case 'HEAD':
//     case 'GET':
//       return req.session.get('auth', function (er, data) {
//         if (data && !data.error) return res.redirect("/profile")

//         // if ?done=/package/pkg - redirect to pkg after logging in
//         if (req.query.done) req.session.set('done', req.query.done)

//         req.model.load("profile", req);
//         req.model.end(function(er, m) {
//           // error just means we're not logged in.
//           var locals = {
//             profile: m && m.profile,
//             hiring: req.model.whoshiring,
//             error: null
//           }

//           res.template('login.ejs', locals)
//         })
//       })

//     default:
//       return res.error(405)
//   }
// }

// function handleForm (req, res) {
//   req.on('form', function (data) {
//     if (!data.name || !data.password) {
//       return res.template('login.ejs', {error: 'Name or password not provided', hiring: req.model.whoshiring})
//     }

//     req.couch.login(data, function (er, cr, couchSession) {
//       if (er) return res.error(er, 'login.ejs')
//       if (cr.statusCode !== 200) {
//         return res.template('login.ejs', {error: 'Username and/or password is wrong', hiring: req.model.whoshiring})
//       }

//       // look up the profile data.  we're gonna need
//       // it usually anyway.
//       var pu = '/_users/org.couchdb.user:' + data.name
//       req.couch.get(pu, function (er, cr, data) {
//         if (er || cr.statusCode !== 200) {
//           return res.error(er, 401, 'login.ejs')
//         }

//         req.session.set("profile", data)

//         // just a convenience.
//         if (data)
//           res.cookies.set('name', data.name)

//         if (data && data.mustChangePass) {
//           return res.redirect('/password')
//         }

//         res.session.get('done', function (er, done) {
//           req.metrics.counter('users>logins')

//           var donePath = '/profile'
//           if (done) {
//             // Make sure that we don't ever leave this domain after login
//             // resolve against a fqdn, and take the resulting pathname
//             done = url.resolveObject('https://example.com/login', done.replace(/\\/g, '/'))
//             donePath = done.pathname
//           }

//           res.session.del('done')
//           res.redirect(donePath)
//         })
//       })
//     })
//   })
// }
