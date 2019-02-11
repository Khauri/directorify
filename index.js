/**
 * Create and manage a virtual file system
 */
exports.Directory = require('./src')
exports.mixins = {
    fs : require('./src/mixins/fs')
}

const root = new exports.Directory(/** directory_name=*/'root')

// Add file at arbitrary path
root.file('path/to/file.js', true)
// To add a directory, make sure the path ends with '/'
root.file('path/to/directory/', true)
// Returns null if file does not exist at location
// Throws TypeError if any part of path is not a directory
let fileNode = root.file('/path/to/file.js')
// console.log(fileNode.fullPath) // root/path/to/file.js
// Change directory
root.cd('path/to')
// Change directory using relative path syntax
root.cd('./directory')
// Get cwd
console.log(root.cwd) // path/to/directory/
// Add a file using relative syntax
fileNode = root.file('./file2.js', true)
// To use an absolute path, start the path with a /
fileNode = root.file('/file3.js', true)
// Change directory with relative path
// log the full Tree
console.log(root.toString() /* or just root */) // See example string
// Get the tree as JSON
const asJSON = root.toJSON()
console.log( JSON.stringify(asJSON, null, 2)) // See example json