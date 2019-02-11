/** @module FileTree */

/*
 * @typedef { {static:{[key:string]:Function}, instance:{[key:string]:Function}}} mixin
 */

const { EventEmitter } = require("fbemitter")

const KNode = require('./KNode')

const splitPath = (path) => {
    if(typeof path !== 'string'){
        throw TypeError("path is not a string or array")
    }
    let result = path.replace(/\\+|\/+/, "/").split("/").filter(Boolean)
    return { path : result, isDirectory : path.endsWith('/') }
}

class TreeNode extends KNode {
    get fileName(){
        return this.data.fileName + (this.data.isDirectory ? "/" : "")
    }

    /**
     * @returns {Boolean}
     */
    get isDirectory(){
        return this.data.isDirectory
    }

    get fullPath(){
        if(!this._fullPath){
            let curr = this,
                result = ""
            while(curr != null){
                result = curr.fileName + result
                curr = curr.parent
            }
            this._fullPath = result
        }
        return this._fullPath
    }

    toJSON(){
        const result = {
            fileName : this.fileName,
            fullPath : this.fullPath,
            isDirectory : this.isDirectory,
            size : this.size
        }
        if(this.isDirectory){
            result.children = this.children.map((child)=>child.toJSON())
        }
        return result
    }
    
    /**
     * 
     */
    toString(){
        const corner = '└─ ',
              cross  = '├─ ',
              pipe   = '│  ',
              space  = '   '
        const toStringHelper = (node, indent="", isTop=true, isLast=false) => {
            let result = indent
            if(isTop === false){
                if(isLast === true){
                    result += corner
                    indent += space
                }else{
                    result += cross
                    indent += pipe
                }
            }
            result += `${node.fileName}\n`
            const children = node.children
            children.forEach((child,i)=>{
                const isLast = i === children.length-1
                result += `${toStringHelper(child, indent, false, isLast)}`
            })
            return result
        }
        return toStringHelper(this)
    }

    [Symbol.for('nodejs.util.inspect.custom')](){
        return this.toString()
    }
}
/** @class */
class FileTree extends EventEmitter {
    constructor(rootName=''){
        super()
        this._root = new TreeNode({
                isDirectory : true,
                fileName : rootName,
                eventEmitter : this
            }, { key : '/'})
        this._cd = this._root
        this._plugins = new Map()
    }
    /**
     * @param {mixin} obj
     * @mixes obj
     */
    static mixin(obj){
        const { statics, members } = obj
        if(statics){
            for(let key in statics){
                this[key] = statics[key].bind(this)
            }
        }
        if(members){
            for(let key in members){
                this.prototype[key] = members[key]
            }
        }
        return this
    }
    // __emitToSubscription(subscription, eventType){

    // }
    get cwd(){
        let curr = this._cd.isDirectory ? this._cd : this._cd.parent,
            result = ""

        while(curr.parent !== null){
            result = `${curr.fileName}${result}`
            curr = curr.parent
        }
        return result
    }
    /**
     * Change directory
     * @throws {TypeError} If directory not found
     */
    cd(path){
        let dir = this.file(path)
        if(!dir.isDirectory){
            throw new TypeError(`${path}: Not a directory`)
        }
        this._cd = dir
        return this
    }
    /**
     * Add or get a file/directory from a particular path
     * @returns {TreeNode}
     */
    file(p=null, createIfMissing=false){
        if(!p){
            throw new TypeError("path required")
        }
        // TODO: Use a more advanced path splitting technique or module
        let {path, isDirectory} = splitPath(p)
        let curr = p.startsWith('/') ? this._root : this._cd
        for(let i in path){
            let key = path[i]
            let isNotLastPath = i < path.length-1
            let temp
            if(key === '..'){
                temp = curr.parent || curr
            }
            else if(key === '.'){
                temp = curr
            } else {
                temp = curr.getChildByKey(key)
            }
            if(!temp){
                if(createIfMissing !== true){
                    return null
                }
                // Create a new directory/file
                temp = curr.appendChild({
                    isDirectory : isNotLastPath || isDirectory,
                    fileName : key,
                }, { key })
            }
            // Check if all but last node is a directory
            if(isNotLastPath && !temp.isDirectory){
                throw new TypeError(`Cannot create path at ${path.join("/")} because ${path.slice(0,i).join("/")} is not a directory`)
            }
            curr = temp
        }
        return curr
    }

    toJSON(){
        return this._root.toJSON()
    }

    toString(){
        return this._root.toString()
    }

    [Symbol.for('nodejs.util.inspect.custom')](){
        return this._root.toString()
    }
}
FileTree._plugins = new Map()

module.exports = FileTree