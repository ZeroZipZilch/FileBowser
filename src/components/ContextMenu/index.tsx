import React, { Component } from 'react'

interface ContextMenuProps {
  viewType: string
  currentPath: string
  handleContextMenu: (option: string, path: string, type: string) => void
}

interface ContextMenuState {
  contextPath: string
  contextType: string
  xPos: string
  yPos: string
  showMenu: boolean
  onlyAdd: boolean
}

export default class ContextMenu extends Component<ContextMenuProps, ContextMenuState> {
  state = {
    contextPath: '',
    contextType: '',
    xPos: "0px",
    yPos: "0px:",
    showMenu: false,
    onlyAdd: false,
  }

  componentDidMount() {
    document.addEventListener("click", this.handleClick)
    document.addEventListener("contextmenu", this.handleContextMenu)
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleClick)
    document.removeEventListener("contextmenu", this.handleContextMenu)
  }

  handleClick = (e: any) => {
    const clickedItem = e.target.closest(`[class=context-menu-item]`)

    if (clickedItem) {
      this.props.handleContextMenu(e.target.id, this.state.contextPath, this.state.contextType)
    }

    if (this.state.showMenu) this.setState({ showMenu: false, contextPath: '', contextType: '' })
  }

  handleContextMenu = (e: any) => {
    // If an item is right-clicked
    if (e.target.closest(`[class=hasContext]`)) {
      this.setState({
        contextPath: e.target.dataset.path,
        contextType: e.target.dataset.type,
        xPos: `${e.pageX}px`,
        yPos: `${e.pageY}px`,
        showMenu: true,
        onlyAdd: false, // This determines wether we can rename/ delete items
      })
    } else { // Otherwise, if anywhere else on the document/ window is right-clicked
      if (this.props.viewType === 'tree') {
        this.setState({
          contextPath: '/',
          contextType: 'dir',
          xPos: `${e.pageX}px`,
          yPos: `${e.pageY}px`,
          showMenu: true,
          onlyAdd: true, // This determines wether we can rename/ delete items
        })
      } else {
        this.setState({
          contextPath: this.props.currentPath,
          contextType: 'dir',
          xPos: `${e.pageX}px`,
          yPos: `${e.pageY}px`,
          showMenu: true,
          onlyAdd: true, // This determines wether we can rename/ delete items
        })
      }
    }
  }

  render() {
    const { showMenu, xPos, yPos } = this.state;

    if (showMenu) {
      return (
        <ul
          className="context-menu"
          style={{
            position: 'absolute',
            background: '#595959',
            color: '#fafafa',
            padding: '1em 0.5em',
            borderRadius: '0.5em',
            listStyle: 'none',
            top: yPos,
            left: xPos,
          }}
        >
          <li className="context-menu-item" id="contextAddFile">Add File</li>
          <li className="context-menu-item" id="contextAddDir">Add Directory</li>
          {this.state.onlyAdd ? null : <li className="context-menu-item" id="contextDelete">Delete</li>}
          {this.state.onlyAdd ? null : <li className="context-menu-item" id="contextRename">Rename</li>}
        </ul>
      )
    }
    
    return null;
  }
}