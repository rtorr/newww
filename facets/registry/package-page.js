module.exports = function (request, reply) {
  var getPackage = request.server.methods.getPackage;

  getPackage(request.params.package, function (er, data) {
    if (er) { // user probably isn't logged in
      console.error('error! ', er)
    }

    reply.view('package-page', {
      package: data
    });
  })
}