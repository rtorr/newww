module.exports = function sinceUpdated (time) {
  var now = Date.now();
  var m = now - (new Date(time).getTime());
  m = Math.floor(m / (1000 * 60));
  return m;
}