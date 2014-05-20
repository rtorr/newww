module.exports = function showField (field) {
  var emailInfo = '',
      show = field.show;

  if (field.name === 'email') {
    var map = Array.prototype.map;
    var obfuscatedEmail = map.call(field.value, function (x) {
      return '%' + x.charCodeAt(0).toString(16)
    }).join('');

    emailInfo = 'id="email" data-email="' + obfuscatedEmail + '"';
    show = '[email]';
  }

  return '<td ' + emailInfo + '>' + show + '</td>';
}