var fs = require('fs')
  , path = require('path')
  , util = require('util')

var request = require('request')
  , object = require('isomorph/lib/object')

function normjoin(path1, path2) {
  return path.normalize(path.join(path1, path2))
}

/**
 * Reads a template string from the given path and formats it with any
 * additional arguments given.
 */
var formatTemplate = exports.formatTemplate = function(templatePath) {
  var template = fs.readFileSync(templatePath).toString()
    , args = Array.prototype.slice.call(arguments, 1)
  return util.format.apply(util, [template].concat(args))
}

/**
 * Dumb build process for manually exporting components written using Node.js
 * modules and their dependencies for use in the browser. All paths other than
 * config.root are relative to config.root.
 *
 * config.root -- absolute path to build root directory (usually project dir)
 * config.modules -- {code path -> [require() string]} as used in your code
 * config.exports -- {global variable name -> require() string} to be exported
 * config.output -- built output file location
 * config.header -- comment header for inclusion in output and compressed files (if given)
 * config.compress -- compressed output file location (if given)
 */
exports.build = function(config) {
  config = object.extend({header: '', compress: ''}, config)

  // Input
  var exported = []
  for (var relativePath in config.modules) {
    var modulePath = normjoin(config.root, relativePath)
      , requireStrings = config.modules[relativePath]
    console.log('compile: %j (from %s)', requireStrings, modulePath)
    exported.push(
      util.format("require.define(%j, function(module, exports, require) {\n", requireStrings) +
      fs.readFileSync(modulePath) +
      '})\n'
    )
  }
  for (var name in config.exports) {
    exported.push(
      util.format("window['%s'] = require('%s')", name, config.exports[name])
    )
  }

  // Output
  var code = formatTemplate(normjoin(__dirname, '../support/template.js'),
                            exported.join('\n'))
    , outputPath = normjoin(config.root, config.output)
  console.log('create: %s', outputPath)
  fs.writeFileSync(outputPath, config.header + code)

  // Compress
  if (!config.compress) {
    return
  }

  var compressedOutputPath = normjoin(config.root, config.compress)

  function printErrorInfo(err) {
    console.error('  %s:%s [%s] %s\n    %s\n',
                  err.lineno, err.charno, err.type, err.error || err.warning, err.line)
  }

  function processClosureCompilerResponse(err, response, body) {
    if (err) throw err
    var result = JSON.parse(body)
    console.log('statusCode: %s', response.statusCode)
    if (result.hasOwnProperty('errors')) {
      console.error('errors:')
      result.errors.forEach(printErrorInfo)
    }
    if (result.hasOwnProperty('warnings')) {
      console.error('warnings:')
      result.warnings.forEach(printErrorInfo)
    }
    if (!result.hasOwnProperty('errors')) {
      console.log('statistics:')
      console.log('  original size: %s (%s gzipped)',
                  result.statistics.originalSize, result.statistics.originalGzipSize)
      console.log('  compressed size: %s (%s gzipped)',
                result.statistics.compressedSize, result.statistics.compressedGzipSize)
      console.log('compressed: %s', compressedOutputPath)
      fs.writeFileSync(compressedOutputPath, config.header + result.compiledCode)
    }
  }

  console.log('compressing %s...', outputPath)
  request.post({
      url: 'http://closure-compiler.appspot.com/compile'
    , form: {
        js_code: code
      , compilation_level: 'SIMPLE_OPTIMIZATIONS'
      , output_format: 'json'
      , output_info: ['compiled_code', 'errors', 'warnings', 'statistics']
      }
    }
  , processClosureCompilerResponse)
}
