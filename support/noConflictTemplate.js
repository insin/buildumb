;(function() {
  var _require = window.require
    , modules = {}
  function require(name) {
    return modules[name]
  }
  require.noConflict = function() {
    if (window.require === require) {
      window.require = _require
    }
  }
  require.define = function(rs, fn) {
    var module = {}
      , exports = {}
    module.exports = exports
    fn(module, exports, require)
    if (Object.prototype.toString.call(rs) == '[object Array]') {
      for (var i = 0, l = rs.length; i < l; i++) {
        modules[rs[i]] = module.exports
      }
    }
    else {
      modules[rs] = module.exports
    }
  }

%s

})();