import React, { Component } from 'react'

import Directory from '../Directory'
import File from '../File'

const _isEqual = require('lodash/isEqual')

interface FileViewState {
  directories: string[],
  files: string[],
  parentPath: string,
}

interface FileViewProps {
  currentPath: string,
  fileTree: any,
  changePath: (to: string) => void,
  renameItem: (e: any, itemPath: string, value: string) => void,
  setDraggingPath: (path: string) => void,
  draggingPath: string,
  setHoveringPath: (path: string) => void,
  hoveringPath: string,
  resetDragPaths: () => void,
  moveItem: () => void,
}

export default class FileView extends Component<FileViewProps, FileViewState> {
  constructor(props: any) {
    super(props)

    this.state = {
      directories: [],
      files: [],
      parentPath: "",
    }
  }

  componentDidMount() {
    this.getItems(this.props)
  }

  shouldComponentUpdate(nextProps: any, nextState: any): boolean {
    // When recieving a new state, refresh the state with new directories and files
    // for current path to re-render component
    if (!_isEqual(this.props, nextProps) || !_isEqual(this.state, nextState)) {
      this.getItems(nextProps)
      return true;
    }
    
    return false
  }

  /**
   * Get directories in current path
   */
  getItems(props: any) {
    let pathArray: string[] = props.currentPath.split('/')
    let currentPath: any
    let files: any[] = []
    const directories: any[] = []

    // While path is not root
    while (pathArray.length > 0) {
      //Navigate through the path-array by setting pathItem to the first item in the array
      let pathItem: string = pathArray.shift() !

      // First iteration, set currentPath to first item. For example:
      // Path is marvel/black_widow
      // Set currentPath to `marvel`. Now currentPath contains everything in the `marvel` object
      if (currentPath === undefined) {
        currentPath = props.fileTree[pathItem]
      } else {
        // Second iteration and further
        // pathItem will keep being updated. So on second iteration, it'd have
        // the value black_widow. So now we enter the `black_widow` object inside of `marvel`
        currentPath = currentPath[pathItem]
      }
    }

    // If currentPath is still undefined, we are on the root to begin with
    // Simply set currentPath to the contents of the fileTree root
    if (currentPath === undefined) {
      currentPath = props.fileTree
    }

    // Just an extra precaution to not get errors
    // (would probably result in a blank screen if this happens)
    // Either way; this is where we get all the directories and files on the current path
    // and store them in the state
    if (currentPath !== undefined) {
      // Iterate over all keys in currentPath
      Object.keys(currentPath).map((item: string) => {
        if (item === 'files') {
          // If the current object key is `files`, loop through it, create a new files array,
          // and oush an object containing label, path and input to it
          let filePath = props.currentPath === '/' ? '' : props.currentPath
          files = currentPath['files'].map((file: any) => {
            return {label: file.label, path: `${filePath}/${file.label}`, input: file.input}
          })

          return
        } else if (item !== 'open' && item !== 'creating' && item !== 'input') {
          // If the above didn't return, we are dealing with a directory (if we apply some filters)
          // Push it to the directories array
          let dirPath = props.currentPath === '/' ? '' : props.currentPath
          directories.push({ label: item, path: `${dirPath}/${item}`, input: currentPath[item]['input']})
          return
        }
      })

      // Doing this to ensure we don't get paths like /////, which was an issue
      // Basically, filter out any empty entries in the array (for example root had ["", ""])
      let parentPath = props.currentPath.split('/').reduce((acc:string[], cur: string) => {
        if (cur !== "") {
          acc.push(cur)
        }

        return acc
      }, [])

      // Now if it's not at root, remove one entry
      if (parentPath.length > 0) {
        parentPath.pop()
      }

      parentPath = parentPath.join('/')

      // If the path is empty, set it to /, otherwise, prepend it with a /
      if (parentPath == '') {
        parentPath = '/'
      } else {
        parentPath = '/' + parentPath
      }

      // And then we refresh the state with all directories and files in the current path
      // to re-render
      this.setState({...this.state, directories, files, parentPath})
    }
  }

  render() {
    console.log(this.state)
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap'
        }}
      >
        {/* This first Directory element is for moving up one level.
        Only visible if currentPath is not root */}
      {this.props.currentPath !== '/' ? <Directory
          directoryName=".."
          directoryPath={this.state.parentPath}
          input={false}
          changePath={this.props.changePath}
          renameItem={this.props.renameItem}
          moveItem={this.props.moveItem}
          setDraggingPath={this.props.setDraggingPath}
          setHoveringPath={this.props.setHoveringPath}
          resetDragPaths={this.props.resetDragPaths}
          draggingPath={this.props.draggingPath}
          hoveringPath={this.props.hoveringPath}
        /> : null}

      {this.state.directories.map((directory: any, i: number) => {
        return <Directory
          key={`fileviewdirectory-${i}-${directory.label}`}
          directoryName={directory.label}
          directoryPath={directory.path}
          input={directory.input}
          changePath={this.props.changePath}
          renameItem={this.props.renameItem}
          moveItem={this.props.moveItem}
          setDraggingPath={this.props.setDraggingPath}
          setHoveringPath={this.props.setHoveringPath}
          resetDragPaths={this.props.resetDragPaths}
          draggingPath={this.props.draggingPath}
          hoveringPath={this.props.hoveringPath}
        />
      })}

      {this.state.files.map((file: any, i: number) => {
        return <File
          key={`fileviewfile-${i}-${file.label}`}
          fileName={file.label}
          filePath={file.path}
          input={file.input}
          renameItem={this.props.renameItem}
          moveItem={this.props.moveItem}
          setDraggingPath={this.props.setDraggingPath}
          setHoveringPath={this.props.setHoveringPath}
          resetDragPaths={this.props.resetDragPaths}
          draggingPath={this.props.draggingPath}
          hoveringPath={this.props.hoveringPath}
        />
      })}
      </div>
    )
  }
}