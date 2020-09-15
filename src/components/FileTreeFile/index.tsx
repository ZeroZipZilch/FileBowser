import React, { Component } from 'react'

import Input from '../Input'

interface FileTreeFileProps {
  fileName: string,
  filePath: string,
  indent: number,
  input: boolean,
  renameItem: (e: any, itemPath: string, value: string) => void
}

export default class FileTreeFile extends Component<FileTreeFileProps> {
  render() {
    const { fileName, filePath, indent, renameItem, input } = this.props
    
    if (this.props.input) {
      return (
        <Input itemName={fileName} itemPath={filePath} indent={indent} renameItem={renameItem} />
      )
    }

    return (
      <div
        className="hasContext"
        data-path={filePath}
        style={{marginLeft: (1 * this.props.indent) + 'em'}} >{fileName}
      </div>
    )
  }


}