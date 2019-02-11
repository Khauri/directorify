const fs = require('fs'), 
    path = require('path')

const FileTree = require('../index')

/**
 * 
 * @param {String} str The string to test
 * @param {Array|String|RegExp} rules A rule or array of rules to test on the string
 */
function test(str, rules){
    if(rules instanceof RegExp){
        return rules.test(str)
    }
    if(typeof rules === 'string'){
        return str.endsWith(rules)
    }
    if(rules instanceof Array){
        return rules.some(rule=>test(str, rule))
    }
}

/**
 * List all files in a directory recursively in a synchronous fashion.
 *
 * @param {String} dir - The directory to walk
 * @returns {IterableIterator<String>}
 */
function *walkSync(dir, options={}) {
    const files = fs.readdirSync(dir)
    const { ignore = [] } = options

    for (const file of files) {
        const pathToFile = path.join(dir, file)
        const isDirectory = fs.statSync(pathToFile).isDirectory()
        if(test(pathToFile, ignore)){
            continue
        }
        if (isDirectory) {
            yield `${pathToFile}/`
            // Determine if we should ignore directory
            yield *walkSync(pathToFile, options)
        } else {
            // Determine if we should ignore the file
            yield pathToFile;
        }
    }
}

/** 
 * @mixin
 * @lends module:FileTree~FileTree 
 */
const StaticMixins = {
    /**
     * 
     * @param {*} dir 
     * @param {*} cbOrBool 
     * @param {*} options
     */
    fromDirAsync(dir, cbOrBool, options){
        return ft
    },
    /**
     * 
     * @param {*} dir 
     * @param {*} cbOrBool 
     * @param {*} options 
     */
    fromDir(dir, cbOrBool, options){
        if(typeof cbOrBool === 'object'){
            options = cbOrBool
            cbOrBool = false
        }
        const isAsync = cbOrBool === true || typeof cbOrBool === 'function'
        if(isAsync){
            return this.fromDirAsync(dir, cbOrBool, options)
        }
        let ft = new FileTree(path.basename(path.resolve(dir)))
        for(const file of walkSync(dir, options)){
            ft.file(file, true)
        }
        return ft
    },
}

/** @lends module:FileTree~FileTree.prototype */
const MemberMixins = {
    mkDir(dir){
        const p = path.resolve(this.cwd, dir)
        if (!fs.existsSync(p)){
            fs.mkdirSync(p)
        }
        this.file(dir+'/', true)
    }
}

module.exports = {
    statics : StaticMixins,
    members : MemberMixins
}