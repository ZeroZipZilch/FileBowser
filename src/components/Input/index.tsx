import React, { Component } from 'react'

const _isEqual = require('lodash/isEqual')

interface FileTreeInputProps {
  itemName: string
  itemPath: string
  itemType: string
  indent?: number
  renameItem: (e: any, itemPath: string, value: string, itemType: string) => void
}

interface FileTreeInputState {
  inputValue: string
}

export default class FileTreeDirectory extends Component<FileTreeInputProps, FileTreeInputState> {
  state = {
    inputValue: ''
  }

  inputRef: React.RefObject<HTMLInputElement>

  constructor(props: any) {
    super(props)

    this.handleKeypress = this.handleKeypress.bind(this)
    this.handleRename = this.handleRename.bind(this)
    this.focusInput = this.focusInput.bind(this)

    this.inputRef = React.createRef()
  } 

  componentDidMount() {
    this.setState({ inputValue: this.props.itemName }, this.focusInput)

    document.addEventListener('keydown', this.handleKeypress)
    document.addEventListener('click', this.handleRename)
  }

  componentWillUnmount() {
    this.setState({ inputValue: '' })

    document.removeEventListener('keydown', this.handleKeypress)
    document.removeEventListener('click', this.handleRename)
  }

  handleKeypress(e: KeyboardEvent): void {
    if (e.key == 'Enter' || e.key == 'Escape') {
      this.handleRename(e)
      
      return
    }
  }

  handleRename(e: any) {
    this.props.renameItem(
      e,
      this.props.itemPath,
      this.state.inputValue,
      this.props.itemType
    )
  }

  focusInput() {
    const input = this.inputRef.current

    if (input) {
      input.focus()
      input.select()
    }
  }

  render() {
    const { itemPath, indent = 0 } = this.props

    return (
        <input
          value={this.state.inputValue}
          data-path={itemPath}
          style={{marginLeft: (1 * indent) + 'em'}}
          onBlur={this.handleRename}
          onChange={(e) => { this.setState({ inputValue: e.target.value }) }}
          ref={this.inputRef}
        />
    )
  }


}