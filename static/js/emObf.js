$(document).ready(function () {
  var e = $('#email')
  var em = e.data('email').split('%').slice(1).map(function (x) { 
              return String.fromCharCode(parseInt(x, 16)) 
            }).join('')
  e.html('<a href="mailto:' + em + '">' + em + '</a>')
})

