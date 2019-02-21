// Using esm allows us to use modern ECMAScript in node!
require = require("esm")(module)
module.exports = require("./main/index.js")
