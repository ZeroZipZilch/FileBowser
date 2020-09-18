import React, { Component } from 'react'

import Input from '../Input'

interface FileProps {
  fileName: string,
  filePath: string,
  input: boolean,
  renameItem: (e: any, itemPath: string, value: string) => void,
  setDraggingPath: (path: string) => void,
  draggingPath: string,
  setHoveringPath: (path: string) => void,
  hoveringPath: string,
  resetDragPaths: () => void,
  moveItem: () => void,
}

interface FileState {
  hovering: boolean
}

export default class File extends Component<FileProps, FileState> {
    state = {
    hovering: false
  }

  constructor(props: any) {
    super(props)

    this.dragStart = this.dragStart.bind(this);
    this.dragEnter = this.dragEnter.bind(this);
    this.dragLeave = this.dragLeave.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    this.mouseEnter = this.mouseEnter.bind(this);
    this.mouseLeave = this.mouseLeave.bind(this);
  }

  dragStart(e: any) {
    this.props.setDraggingPath(this.props.filePath)

    e.dataTransfer.setData("text", e.target.id);
    e.dataTransfer.effectAllowed = "move";
    
    const node = document.getElementById("dragImageNode")
    e.dataTransfer.setDragImage(node, 0, 0)
  }
  
  dragEnter(e: any) {
    if (e.target.dataset.path !== this.props.draggingPath) {
      this.setState({ hovering: true })
      this.props.setHoveringPath(this.props.filePath)
    }
  }

  dragOver(e: any) {
    e.preventDefault()

    // Set the dropEffect to move
    e.dataTransfer.dropEffect = "move"
  }
  
  dragLeave(e: any) {
    this.setState({ hovering: false })
    if (e.target.dataset.path !== this.props.draggingPath && this.props.hoveringPath === e.target.dataset.path) {
      this.props.setHoveringPath("")
    }
  }

  dragEnd(e: any) {
    this.props.moveItem()
  }

  mouseEnter() {
    this.setState({ hovering: true })
  }

  mouseLeave() {
    this.setState({ hovering: false })
  }

  render() {
    const { fileName, filePath, renameItem, input, draggingPath, hoveringPath } = this.props
    
    if (this.props.input) {
      return (
        <Input itemName={fileName} itemPath={filePath} renameItem={renameItem} />
      )
    }

    return (
      <div
        draggable
        onDragStart={this.dragStart}
        onDragEnter={this.dragEnter}
        onDragOver={this.dragOver}
        onDragLeave={this.dragLeave}
        onDragEnd={this.dragEnd}
        onMouseEnter={this.mouseEnter}
        onMouseLeave={this.mouseLeave}
        className="hasContext"
        data-path={filePath}
        style={{
          opacity: draggingPath === filePath ? 0.5 : 1,
          display: "flex",
          alignItems: "center",
          background: this.state.hovering ? "#3a3a3a" : "transparent",
          padding: "0.5em",
        }} >{fileName}
      </div>
    )
  }


}