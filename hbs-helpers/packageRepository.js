module.exports = function packageRepository (repo) {
  var gh,
      before = '',
      after = '';

  gh = repo.url && repo.url.match(
          /^(?:https?:\/\/|git(?::\/\/|@))(gist.github.com|github.com)[:\/](.*?)(?:.git)?$/)
  if (gh) {
    gh = 'https://' + gh[1] + '/' + gh[2]
    before = '<a href="' + gh + '">';
    after = '</a>'
  }

  return before + repo.url + after + ' (' + repo.type + ')'
}