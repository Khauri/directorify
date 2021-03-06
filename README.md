# Directorify
***This package is still under heavy development***

Create virtual or actualized directories with ease. Originally creeated to pretty print directory structures but now can do so much more.

## Installation

```bash
npm install directorify
# or 
yarn add directorify
```

## Usage

### Basic Usage
```js
const { Directory, mixins } = require('directorify')

// Create a virtual directory
const root = new Directory(/* directory_name=*/'root')

// Add file at arbitrary path
root.file('path/to/file.js', true)

// To add a directory, make sure the path ends with '/'
root.file('path/to/directory/', true)

// Returns null if file does not exist at location
// Throws TypeError if any part of path is not a directory
let fileNode = root.file('/path/to/file.js')

// Change directory
root.cd('path/to')

// Change directory using relative path syntax
root.cd('./directory')

// Get cwd
console.log(root.cwd) // logs: path/to/directory/

// Add a file using relative syntax
fileNode = root.file('./file2.js', true)

// To use an absolute path, start the path with a /
fileNode = root.file('/file3.js', true)

// Get string representation of tree
root.toString()

// Get the tree as JSON
const asJSON = root.toJSON()
```

Example String Output:

```
root/
├─ path/
│  └─ to/
│     ├─ file.js
│     └─ directory/
│        └─ file2.js
└─ file3.js
```


<details>
<summary>Example JSON Output</summary>
<p>

```json
{
  "fileName": "root/",
  "fullPath": "root/",
  "isDirectory": true,
  "size": 2,
  "children": [
    {
      "fileName": "path/",
      "fullPath": "root/path/",
      "isDirectory": true,
      "size": 1,
      "children": [
        {
          "fileName": "to/",
          "fullPath": "root/path/to/",
          "isDirectory": true,
          "size": 2,
          "children": [
            {
              "fileName": "file.js",
              "fullPath": "root/path/to/file.js",
              "isDirectory": false,
              "size": 0
            },
            {
              "fileName": "directory/",
              "fullPath": "root/path/to/directory/",
              "isDirectory": true,
              "size": 1,
              "children": [
                {
                  "fileName": "file2.js",
                  "fullPath": "root/path/to/directory/file2.js",
                  "isDirectory": false,
                  "size": 0
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "fileName": "file3.js",
      "fullPath": "root/file3.js",
      "isDirectory": false,
      "size": 0
    }
  ]
}
```

</p>
</details>

## Mixins

This package includes mixins intended to increase the utility of the core module.

### fs

A Directorify directory tree can be created from a directory on an actual filesystem, in non-browser environments, by utilizing the fs mixin.

This simply wraps some common functionality such as creating and removing files and directories.


```js
const { Directory, mixins } = require('directorify')

Directory.mixin(mixins.fs)

// Static methods
// Create tree from actual directory
const root = Directory.fromDir('./')

// Instance methods
// Create a new directory
root.mkDir('/path/to/dir')
```

## Development

### Docs
The docs are a mess, but take a look by using:

```bash
yarn docs
# or
npm run docs
```

### Testing
No tests yet but they're coming after I get the docs sorted