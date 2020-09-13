import React, { Component } from 'react'

const _isEqual = require('lodash/isEqual')

import Directory from '../Directory'
import File from '../File'

interface FileTreeProps {
  directories: string[],
  files: string[],
  changePath: (to: string) => void,
}

export default class FileTree extends Component<FileTreeProps> {
  shouldComponentUpdate(nextProps: any): boolean {
    if (!_isEqual(this.props, nextProps)) {
      return true;
    }
    
    return false
  }

  listDirectories(props: any) {
    return props.directories.map((dir: string) => <Directory directory={dir} changePath={this.props.changePath} />)
  }

  listFiles(props: any) {
    console.log(props)
    return props.files.map((filename: string) => <File filename={filename} />)
  }

  render() {
    return (
      <div>
        <div onClick={() => this.props.changePath('..')}>...</div>
        {this.listDirectories(this.props)}
        {this.listFiles(this.props)}
      </div>
    )
  }


}