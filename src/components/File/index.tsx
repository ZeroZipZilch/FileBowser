import React, { Component } from 'react'

interface FileProps {
  filename: string
}

export default class File extends Component<FileProps> {
  render() {
    return (
      <div>{this.props.filename}</div>
    )
  }


}