;(function(){
  if (location.pathname === '/') {
    var m = location.hash.match(/^#\/[^\/]*$/)
    if (m) location.replace('/package' + m[0].substr(1))
  }
  highlight(undefined, undefined, 'pre');
})()