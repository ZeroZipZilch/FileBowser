import React, { Component } from 'react';
import ReactDom from 'react-dom';

import FileView from './components/FileView'

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

interface Props {

}

interface State {
  fileTree: {},
  currentPath: string,
  viewType: string // tree, osx, windows explorer
}

class App extends Component<Props, State> {
  constructor(props: any) {
    super(props)

    this.state = {
      fileTree: {},
      currentPath: '/marvel/black_widow',
      viewType: 'tree'
    }

    this.changePath = this.changePath.bind(this)
  }

  componentDidMount() {
    this.setState({...this.state, fileTree: this.initializeFileTree()})
  }

  initializeFileTree(): any {
    const paths = [
      "marvel/black_widow/bw.png",
      "marvel/drdoom/the-doctor.png",
      "fact_marvel_beats_dc.txt",
      "dc/aquaman/mmmmmomoa.png",
      "marvel/black_widow/why-the-widow-is-awesome.txt",
      "dc/aquaman/movie-review-collection.txt",
      "marvel/marvel_logo.png",
      "dc/character_list.txt"
    ]

    let structure: any = {}

    paths.map(path => {
      const pathArray = path.split('/') // Split the path into an array of items
      // Reduce the array into an object path
      
      pathArray.reduce((structureObject: any, currentItem: any, i) => {
        // If we are on the last item in the pathArray (++i because zero index)
        if (pathArray.length === ++i) {
          // Create a files array at our current position in the structureObject
          // if it doesn't already exist
          if (structureObject['files'] === undefined) {
            structureObject['files'] = []
          }

          // Add the item to the files array
          structureObject['files'].push(currentItem)

          // Return the object here so we don't move past this if-statement
          return structureObject
        }

        // If we get here, we're not on the final item in the path yet
        // If the path already exists in the structure,
        // simply return it as is for the next reduce iteration,
        // otherwise, create a new object on said path and return that
        return structureObject[currentItem] = structureObject[currentItem] || {}
      }, structure)
    })

    return structure
  }

  changePath(to: string) {
    // Make the path into an array
    let path = this.state.currentPath.split("/")

    // If instruction is to "go up" and the array has entries
    if (to === '..' && path.length) {
      // Remove the last directory form the array
      path.pop()

      // If it's empty, set it to root
      if (!path.length) {
        path.push('/')
      }
    } else {
      // Otherwise we want to go to a directory
      // Add new directory to path
      path.push(to)
    }

    // Change the state by joining the path array into a string again
    this.setState({...this.state, currentPath: path.join('/')})
  }

  render() {
    return (
      <FileView
        viewType={this.state.viewType}
        currentPath={this.state.currentPath}
        fileTree={this.state.fileTree}
        changePath={this.changePath}
      />
    )
  }
}

ReactDom.render(<App />, mainElement);