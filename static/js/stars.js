/*
	Let's get these stars up in here
*/

function addExpiration () {
  var NUM_SECONDS = 60
  var d = new Date()
  d.setTime(d.getTime() + NUM_SECONDS*1000)
  return '; expires='+d.toGMTString()
}

function getPackages (name) {  
  var packages = document.cookie.split(";")
                  .map(function(k) { 
                    return k.trim().split("=") 
                  })
                  .reduce(function (set, kv) { 
                    set[kv.shift()] = kv.join("="); 
                    return set
                  },{})

  return name ? packages[name] : packages
}

$(document).ready(function () {
  // check if there's already a cookie
  var packageName = $('.star').data('name')
  
  var starType = getPackages(packageName)

  if (starType) {
    if (starType === 'star') {
      $('.star').addClass('star-starred')
    } else {
      $('.star').removeClass('star-starred')
    }
  }

  // user clicks on the star
  $('.star').click(function (e) {
    // let's turn this into a checkbox eventually...
    e.preventDefault()
    var packages = getPackages()

    var data = {}
    data.name = $(this).data('name')
    data.isStarred = $(this).hasClass('star-starred')

    $.ajax({
      url: '/star'
    , data: JSON.stringify(data)
    , type: 'POST'
    })
    .done(function (resp) {

      if (data.isStarred) {
        // console.log('no more yellow :-(')
        $('.star').removeClass('star-starred')
        document.cookie = data.name + '=nostar' + addExpiration()
      } else {
        // console.log('make it into a star!!')
        $('.star').addClass('star-starred')
        document.cookie = data.name + '=star' + addExpiration()
      }

    })
    .error(function (resp) {
      // we're probably not logged in
      // console.log('error: ', resp)
      window.location = '/login?done=/package/' + data.name
    })
  })

})