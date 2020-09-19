import React, { Component } from 'react'

import Input from '../Input'

interface FileProps {
  fileName: string
  filePath: string
  input: boolean
  draggingPath: string
  hoveringPath: string
  renameItem: (e: any, itemPath: string, value: string, itemType: string) => void
  setDraggingPath: (path: string, type: string) => void
  setHoveringPath: (path: string, type: string) => void
  resetDragPaths: () => void
  moveItem: () => void
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

  /**
   * When dragging starts, update dragging path in app state
   * Set the drag image
   */
  dragStart(e: any) {
    this.props.setDraggingPath(this.props.filePath, 'file')

    e.dataTransfer.setData("text", e.target.id);
    e.dataTransfer.effectAllowed = "move";
    
    const node = document.getElementById("dragImageNode")
    e.dataTransfer.setDragImage(node, 0, 0)
  }
  
  /**
   * When an items area is, set the hoveringPath to the
   * item path in app state
   */
  dragEnter(e: any) {
    if (e.target.dataset.path !== this.props.draggingPath) {
      this.setState({ hovering: true })
      this.props.setHoveringPath(this.props.filePath, 'file')
    }
  }

  /**
   * While dragging over an item, change cursor to move "drop effect"
   */
  dragOver(e: any) {
    e.preventDefault()

    // Set the dropEffect to move
    e.dataTransfer.dropEffect = "move"
  }
  
  /**
   * If leaving a previously hovered item and said item isn't the item we're dragging,
   * unset the hoveringPath
   */
  dragLeave(e: any) {
    this.setState({ hovering: false })
    if (e.target.dataset.path !== this.props.draggingPath && this.props.hoveringPath === e.target.dataset.path) {
      this.props.setHoveringPath('', '')
    }
  }

  dragEnd(e: any) {
    this.props.moveItem()
  }

  /**
   * I hate myself for doing this, but this was the simplest way to
   * add hover effects while using inline styles..
   */
  mouseEnter() {
    this.setState({ hovering: true })
  }

  mouseLeave() {
    this.setState({ hovering: false })
  }

  render() {
    const { fileName, filePath, renameItem, input, draggingPath, hoveringPath } = this.props
    
    // If input is true for this item, show input field rather than the file
    if (this.props.input) {
      return (
        <Input itemName={fileName} itemPath={filePath} renameItem={renameItem} itemType='file' />
      )
    }

    // Otherwise show the file
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
        data-type="file"
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