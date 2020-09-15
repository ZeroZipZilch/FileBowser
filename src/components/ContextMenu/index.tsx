import React, { Component } from 'react'

interface ContextMenuProps {
  handleContextMenu: (option: string, path: string) => void
}

interface ContextMenuState {
  contextPath: string,
  xPos: string,
  yPos: string,
  showMenu: boolean
}

export default class ContextMenu extends Component<ContextMenuProps, ContextMenuState> {
  state = {
    contextPath: '',
    xPos: "0px",
    yPos: "0px:",
    showMenu: false
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
      this.props.handleContextMenu(e.target.id, this.state.contextPath)
    }

    if (this.state.showMenu) this.setState({ showMenu: false, contextPath: '' })
  }

  handleContextMenu = (e: any) => {
    if (e.target.closest(`[class=hasContext]`)) {
      this.setState({
        contextPath: e.target.dataset.path,
        xPos: `${e.pageX}px`,
        yPos: `${e.pageY}px`,
        showMenu: true,
      })
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
          <li className="context-menu-item" id="contextDelete">Delete</li>
          <li className="context-menu-item" id="contextRename">Rename</li>
        </ul>
      )
    }
    
    return null;
  }
}