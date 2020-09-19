import React, { Component } from 'react'

const _isEqual = require('lodash/isEqual')

import FileTreeDirectory from '../FileTreeDirectory'
import FileTreeFile from '../FileTreeFile'

interface FileTreeProps {
  fileTree: any
  draggingPath: string
  hoveringPath: string
  toggleDirectory: (directoryPath: string) => void
  renameItem: (e: any, itemPath: string, value: string, itemType: string) => void
  moveItem: () => void
  setDraggingPath: (path: string, type: string) => void
  setHoveringPath: (path: string, type: string) => void
  resetDragPaths: () => void
}

export default class FileTree extends Component<FileTreeProps> {
  shouldComponentUpdate(nextProps: any): boolean {
    if (!_isEqual(this.props, nextProps)) {
      return true;
    }
    
    return false
  }

  // Recursively traverse the file tree and show directories and files
  // if the directories are marked as open
  traverseFileTree(fileTree: any, i: number, path: string): any[] {
    // Create an items array to store the Nodes somewhere
    const items: any[] = []
    
    // If open doesn't exist or is true, show all files in that root
    if (fileTree['open'] === undefined || fileTree['open'] === true) {
      // Convert all keys at the root of the current file tree to an array
      // and iterate through said array
      Object.keys(fileTree).map((item: string, index: number) => {
        // Now if the key is files or open, we don't want to do anything with it, so move on
        if (item !== 'files' && item !== 'open' && item !== 'input' && item !== 'creating') {
          // If it's a directory, add the directory to the items array we created
          const Dir = <FileTreeDirectory
            key={`filetreedirectory-${i}-${index}-${item}-${path}/${item}`}
            directoryName={item}
            directoryPath={`${path}/${item}`}
            toggleDirectory={this.props.toggleDirectory}
            renameItem={this.props.renameItem}
            moveItem={this.props.moveItem}
            setDraggingPath={this.props.setDraggingPath}
            setHoveringPath={this.props.setHoveringPath}
            resetDragPaths={this.props.resetDragPaths}
            draggingPath={this.props.draggingPath}
            hoveringPath={this.props.hoveringPath}
            indent={i}
            open={fileTree[item]['open']}
            input={fileTree[item]['input']}
          />

          // Yes adding happens here
          items.push(Dir)

          // Now call the method again; this time, for the root of the directory we
          // are currently iterating. Iterate through the results of that method call,
          // and add everything it returns to the current items array
          this.traverseFileTree(fileTree[item], i + 1, `${path}/${item}`)
            .map(item => items.push(item))
        }
      })

      // Now, after the iteration of directories, we want to add all the files
      // (We do it like this to ensure that files appear after directories)
      if (fileTree['files'] !== undefined) {
        // files is an array of items, simply iterate over that
        fileTree['files'].map((file: {label: string, input: boolean}, index: number) => {
          // Create the node for the file
          const File = <FileTreeFile
            key={`filetreefile-${i}-${index}-${file.label}-${path}/${file.label}`}
            fileName={file.label}
            filePath={`${path}/${file.label}`}
            indent={i}
            input={file['input']}
            renameItem={this.props.renameItem}
            moveItem={this.props.moveItem}
            setDraggingPath={this.props.setDraggingPath}
            setHoveringPath={this.props.setHoveringPath}
            resetDragPaths={this.props.resetDragPaths}
            draggingPath={this.props.draggingPath}
            hoveringPath={this.props.hoveringPath}
          />

          // Push the file to the items array
          items.push(File)
        })
      }
    }

    // Now we return the items array
    // If it's the final recursion, this return will contain all the Nodes we
    // want to render
    return items
  }

  render() {
    return (
      <div onDragLeave={(e) => { if (this.props.hoveringPath === "") this.props.setHoveringPath('/', 'dir') }}>
        {this.traverseFileTree(this.props.fileTree, 0, '')}
      </div>
    )
  }


}