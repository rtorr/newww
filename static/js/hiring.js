$(document).ready(function () {

  $('.hiring a').click(function (e) {
    var id = $(this).parent().data('id')
    _gaq.push(['_trackEvent', 'Hiring Ads', 'click', id])
  })

})