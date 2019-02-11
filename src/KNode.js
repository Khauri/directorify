const { EventEmitter } = require("fbemitter")

// TODO: Use a better uuid generator
const uuid = (num) => new Array(num).fill(0).map(()=>(~~(Math.random()*16)).toString(16)).join("")

class KNode {
    /**
     * Create a KNode of a k-ary tree
     * @param {*} data
     * @ param {{parent:KNode, key:String|Function|Number, eventEmitter : EventEmitter}} param1 
     */
    constructor(data=null, { eventEmitter = new EventEmitter(), parent = null, key = uuid(16) }={}){
        this.data = data
        this.parent = parent
        this.eventEmitter = eventEmitter
        if(typeof key === 'function'){
            this.key = key(data)
        }else{
            this.key = key
        }
        // this._children = new Set()
        this._children = new Map()
    }

    get children(){
        return Array.from(this._children.values())
    }

    get size(){
        return this._children.size
    }

    get depth(){
        if(!this._depth || !this._isValid){
            this._depth = this.parent === null ? 0 : this.parent.depth + 1
        }
        return this._depth
    }
    /**
     * Walk through a tree visiting all nodes 
     * @param {*} cb 
     * @param {Boolean} depthFirst  
     */
    walk(cb, depthFirst=false, depth=0, isFirstChild=true, isLastChild=false){
        if(depthFirst === false && cb(this, depth, isFirstChild, isLastChild) === false){
            return false
        }
        const children = this.children
        const firstChild = children[0]
        const lastChild = children[children.length-1]
        for(let child of children){
            // Stop walking if cb returns false
            if(child.walk(cb, depthFirst, depth + 1, child===firstChild, child===lastChild) === false){
                return false
            }
        }
        if(depthFirst === true){
            return cb(this, depth, isFirstChild, isLastChild)
        }
    }
    /**
     * Ascend through a tree until the top is reached
     * @param {*} cb 
     */
    ascend(cb){
        if(cb(this) === false){
            return false
        }
        if(this.parent !== null){
            return this.parent.ascend(cb)
        }
        return true
    }

    /**
     * 
     * @param {KNode} child 
     */
    appendChild(childOrData, options, andRemove=false){
        if(!(childOrData instanceof KNode)){
            childOrData = new this.constructor(childOrData, options)
        }else{
            childOrData.remove()
        }
        // Prevent infinite loops by removing from current position in tree
        this.eventEmitter.emit('add', childOrData)
        this._children.set(childOrData.key, childOrData)
        childOrData.parent = this
        childOrData.eventEmitter = this.eventEmitter
        return childOrData
    }
    
    /**
     * Remove self from tree
     */
    remove(){
        this.eventEmitter.emit('remove', this)
        if(this.parent === null){
            return false
        }
        return this.parent._children.delete(this.key)
    }

    getChildByKey(key){
        return this._children.get(key)
    }
}

module.exports = KNode