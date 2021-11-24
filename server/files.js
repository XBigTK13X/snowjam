const pth = require('path')
const fs = require('fs')

const isDirectory = (path) => fs.statSync(path).isDirectory()
const getDirectories = (path) => {
    return fs
        .readdirSync(path)
        .map((name) => pth.join(path, name))
        .filter(isDirectory)
}

const isFile = (path) => fs.statSync(path).isFile()
const getFiles = (path) => {
    return fs
        .readdirSync(path)
        .map((name) => {
            return pth.join(path, name)
        })
        .filter(isFile)
}

const getFilesRecursively = (path) => {
    let dirs = getDirectories(path)
    let files = dirs.map((dir) => getFilesRecursively(dir)).reduce((a, b) => a.concat(b), [])
    return files.concat(getFiles(path))
}

module.exports = {
    walk: getFilesRecursively,
}
