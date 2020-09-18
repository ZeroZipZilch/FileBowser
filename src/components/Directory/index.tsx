import React, { Component } from 'react'
import { useDrag } from 'react-dnd'

import Input from '../Input'

const _isEqual = require('lodash/isEqual')

interface DirectoryProps {
  directoryName: string,
  directoryPath: string,
  input: boolean,
  changePath: (directoryPath: string) => void,
  renameItem: (e: any, itemPath: string, value: string) => void,
  setDraggingPath: (path: string) => void,
  draggingPath: string,
  setHoveringPath: (path: string) => void,
  hoveringPath: string,
  resetDragPaths: () => void,
  moveItem: () => void,
}

interface DirectoryState {
  hovering: boolean
}

export default class Directory extends Component<DirectoryProps, DirectoryState> {
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
    this.props.setDraggingPath(this.props.directoryPath)

    e.dataTransfer.setData("text", e.target.id);
    e.dataTransfer.effectAllowed = "move";
    
    const node = document.getElementById("dragImageNode")
    e.dataTransfer.setDragImage(node, 0, 0)
  }
  
  dragEnter(e: any) {
    if (e.target.dataset.path !== this.props.draggingPath) {
      this.props.setHoveringPath(this.props.directoryPath)
    }
  }

  dragOver(e: any) {
    e.preventDefault()

    // Set the dropEffect to move
    e.dataTransfer.dropEffect = "move"
  }
  
  dragLeave(e: any) {
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
    const { changePath, renameItem, moveItem, directoryName, directoryPath, draggingPath, hoveringPath } = this.props

    if (this.props.input) {
      return (
        <Input itemName={directoryName} itemPath={directoryPath} renameItem={renameItem} />
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
          onClick={() => {changePath(directoryPath)}}
          data-path={directoryPath}
          className="hasContext"
          style={{
            display: "flex",
            alignItems: "center",
            opacity: draggingPath === directoryPath ? 0.5 : 1,
            color: hoveringPath === directoryPath ? '#1299FA' : 'inherit',
            background: this.state.hovering ? "#3a3a3a" : "transparent",
            padding: "0.5em",
          }}
        >{directoryName}</div>
    )
  }


}