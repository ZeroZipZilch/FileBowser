import React, { Component } from 'react'

import FileTree from '../FileTree'

const _isEqual = require('lodash/isEqual')

interface FileViewState {
  directories: string[],
  files: string[]
}

interface FileViewProps {
  viewType: string,
  currentPath: string,
  fileTree: any,
  changePath: (to: string) => void
}

export default class FileView extends Component<FileViewProps, FileViewState> {
  constructor(props: any) {
    super(props)

    this.state = {
      directories: [],
      files: []
    }
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
    let path: string[] = props.currentPath.split('/')
    let currentPath: any
    let files: string[] = []
    const directories: string[] = []

    // While path is not root
    while (path.length > 0) {
      //Navigate through the path-array by setting pathItem to the first item in the array
      let pathItem: string = path.shift() !

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
          // If the current object key is `files`, simply put them all in a files variable
          files = currentPath['files']
          return
        }

        // If the above didn't return, it means we are dealing with a directory
        // Push it to the directories array
        directories.push(item)
        return
      })

      // And then we refresh the state with all directories and files in the current path
      // to re-render
      this.setState({...this.state, directories, files})
    }
  }

  getView() {
    switch (this.props.viewType) {
      case 'tree':
        return <FileTree
                directories={this.state.directories}
                files={this.state.files}
                changePath={this.props.changePath}
              />
    }
  }

  render() {
    return <div>{this.getView()}</div>
  }
}