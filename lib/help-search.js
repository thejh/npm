
module.exports = helpSearch

var fs = require("./utils/graceful-fs")
  , output = require("./utils/output")
  , path = require("path")
  , asyncMap = require("./utils/async-map")
  , docsPath = path.join(__dirname, "..", "npm", "doc")

helpSearch.usage = "npm help-search <text>"

function helpSearch (args, cb) {
  if (!args.length) return cb(helpSearch.usage)

  fs.readdir(docsPath, function(er, files) {
    if (er) {
      return cb(new Error("Could not load documentation"))
    }

    var search = args.join(" ")
      , results = []
    asyncMap(files, function (file, cb) {
      fs.readFile(function (er, data) {
        if (er) return cb(er)
        if (data.indexOf(search) === -1) return cb(null, [])

        var start = result > 20 ? result - 20 : 0;
          , context = data.substr(start, result - start)
                    + "\033[31;40m"
                    + data.substr(result, search.length)
                    + "\033[0m"
                    + data.substr(result + search.length, 20)

        return cb(null, { file: file, context: context, terms: search })
      })
    }, function (er, results) {
      if (er) return cb(er)
      output.write(results.join("\n"), function (er) { cb(er, results) })
    })

    Object.keys(files).forEach(function (file) {
      var data = fs.readFileSync(docsPath + files[file]).toString()
      var result = data.indexOf(search)
      if (result !== -1) {
        var start = result > 20 ? result - 20 : 0;
        var context = data.substr(start, result - start)
                    + "\033[31;40m" 
                    + data.substr(result, search.length) 
                    + "\033[0m"
                    + data.substr(result + search.length, 20)
        var out = "`npm help " + files[file].replace(".md", "") + "` "
                + context.replace(/\n/gi, "").substr(0,60)
        results.push(out)
      }
    })
  })
}
