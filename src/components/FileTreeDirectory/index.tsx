import React, { Component } from 'react'

import Input from '../Input'

interface FileTreeDirectoryProps {
  directoryName: string,
  directoryPath: string,
  indent: number,
  open: boolean,
  input: boolean,
  toggleDirectory: (directoryPath: string) => void,
  renameItem: (e: any, itemPath: string, value: string) => void
}

export default class FileTreeDirectory extends Component<FileTreeDirectoryProps> {
  render() {
    const { toggleDirectory, renameItem, directoryName, directoryPath, indent } = this.props

    if (this.props.input) {
      return (
        <Input itemName={directoryName} itemPath={directoryPath} indent={indent} renameItem={renameItem} />
      )
    }

    return (
        <div
          data-path={directoryPath}
          className="hasContext"
          style={{marginLeft: (1 * indent) + 'em'}}
          onClick={() => toggleDirectory(directoryPath)}>
            {this.props.open ? `-` : `+`} {directoryName}
        </div>
    )
  }


}