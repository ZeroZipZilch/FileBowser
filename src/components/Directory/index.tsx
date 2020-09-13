import React, { Component } from 'react'

interface DirectoryProps {
  directory: string,
  changePath: (to: string) => void
}

export default class Directory extends Component<DirectoryProps> {
  render() {
    const { changePath, currentPath, directory } = this.props

    return (
      <div onClick={() => changePath(directory)}>{directory}</div>
    )
  }


}