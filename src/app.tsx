import React, { Component } from 'react';
import ReactDom from 'react-dom';

import FileView from './components/FileView'
import FileTree from './components/FileTree';
import ContextMenu from './components/ContextMenu'
import { Cookies } from 'electron/main';
import { SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG } from 'constants';

const _cloneDeep = require('lodash/cloneDeep')

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

interface Props {

}

interface State {
  fileTree: {},
  currentPath: string,
  contextPath: string,
  viewType: string // tree, windows explorer
}

class App extends Component<Props, State> {
  constructor(props: any) {
    super(props)

    this.state = {
      fileTree: {},
      currentPath: '/', // For the FileView layout
      contextPath: '',
      viewType: 'tree'
    }

    this.changePath = this.changePath.bind(this)
    this.toggleDirectory = this.toggleDirectory.bind(this)
    this.handleContextMenu = this.handleContextMenu.bind(this)
    this.renameItem = this.renameItem.bind(this)
  }

  componentDidMount() {
    this.setState({...this.state, fileTree: this.initializeFileTree()})
  }

  initializeFileTree(): any {
    const paths = [
      "marvel/black_widow/bw.png",
      "marvel/black_widow/more/stuff.txt",
      "marvel/drdoom/the-doctor.png",
      "fact_marvel_beats_dc.txt",
      "dc/aquaman/mmmmmomoa.png",
      "marvel/black_widow/why-the-widow-is-awesome.txt",
      "dc/aquaman/movie-review-collection.txt",
      "marvel/marvel_logo.png",
      "dc/character_list.txt"
    ]

    let structure: any = {}

    // Iterate the paths array
    paths.map(path => {
      const pathArray = path.split('/') // Split the path into an array of items
      // Reduce the array into a "path" within the strucutre object
      
      pathArray.reduce((structureObject: any, currentItem: any, i) => {
        // If we are on the last item in the pathArray,
        // We have a file to deal with (++i because zero index)
        if (pathArray.length === ++i) {
          // Create a files array at our current position in the structureObject
          // if it doesn't already exist (just a precaution, it should always exist)
          if (structureObject['files'] === undefined) {
            structureObject['files'] = []
          }

          // Add the item to the files array
          structureObject['files'].push({label: currentItem, input: false, creating: false})

          // Return the object here so we don't move past this if-statement
          return structureObject
        }

        // If we get here, we're not on the final item in the path yet
        // Which means we are dealing with a directory. For the file-tree layout,
        // We want to be able to open/ close the directory. So if a parameter for this
        // Doesn't already exist, we'll add it in the empty object that we'll create
        // If the path already exists in the structure,
        // simply return it as is for the next reduce iteration
        return structureObject[currentItem] = structureObject[currentItem] || { open: false, files: [], input: false }
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

  handleContextMenu(option: string, path: string) {
    switch (option) {
      case "contextAddFile":
        this.addFile(path)
        break;
      case "contextAddDir":
        this.addDirectory(path)
        break;
      case "contextDelete":
        this.deleteItem(path)
        break;
      case "contextRename":
        this.toggleItemInput(path)
        break;
      default:
    }
  }

  // Method to recursively traverse the structure object and modify it on a certain level
  // based on a path
  traverseDirectoryModify(structure:any, pathArray: string[], i: number, end: number, callback: (structure: any) => any) {
    // If we've reached the end
    if (i >= end) {
      // Call the callback method, update the structure, and return it
      structure = callback(structure)
      return structure
    }

    // If we've not reached the end, traverse further down the structure/ file tree
    structure[pathArray[i]] = this.traverseDirectoryModify(structure[pathArray[i]], pathArray, i + 1, pathArray.length, callback)
    return structure
  }
  
  // Method to recursively traverse the structure object and check a value on a certain level
  // based on a path
  traverseDirectoryCheck(structure:any, pathArray: string[], i: number, end: number, callback: (structure: any) => any): any {
    // If we've reached the end
    if (i >= end) {
      // Call the callback method and return its value
      return callback(structure)
    }

    // If we've not reached the end, traverse further down the structure/ file tree
    return this.traverseDirectoryCheck(structure[pathArray[i]], pathArray, i + 1, pathArray.length, callback)
  }

  isDirectory(pathArray: string[]): boolean {
    let structure = _cloneDeep(this.state.fileTree)

    const hasOpen = (structure: any): boolean => {
      return structure?.open !== undefined
    }

    return this.traverseDirectoryCheck(structure, pathArray, 1, pathArray.length, hasOpen)
  }

  addFile(path: string): void {
    // Split the path into an array
    const pathArray = path.split('/')

    // If the selected item is not a directory, remove one item from the pathArray
    if (!this.isDirectory(pathArray)) {
      pathArray.pop();
    }
    
    // Deep clone the structure so we're not working on the state file tree
    let structure = _cloneDeep(this.state.fileTree)

    // By using a function like this we can re-use the traverseDirectoryModify method for other purposes
    const add = function(structure: any) {
      if (structure.open !== undefined) {
        structure.open = true
      }

      structure['files'].push({label: "New File", input: true, creating: true})
      return structure
    }
    
    // Recursively iterate through the structure object and set the structure to its return value
    structure = this.traverseDirectoryModify(structure, pathArray, 1, pathArray.length, add)
    
    // Update state
    this.setState({...this.state, fileTree: structure})
  }

  addDirectory(path: string) {
    // Split the path into an array
    const pathArray = path.split('/')

    // If the selected item is not a directory, remove one item from the pathArray
    if (!this.isDirectory(pathArray)) {
      pathArray.pop();
    }

    // Deep clone the structure so we're not working on the state file tree
    let structure = _cloneDeep(this.state.fileTree)

    // By using a function like this we can re-use the traverseDirectoryModify method for other purposes
    const add = function(structure: any) {
      if (structure.open !== undefined) {
        structure.open = true
      }

      structure['New Directory'] = { open: false, input: true, creating: true, files: [] }
      return structure
    }

    // Recursively iterate through the structure object and set the structure to its return value
    structure = this.traverseDirectoryModify(structure, pathArray, 1, pathArray.length, add)

    // Update state
    this.setState({...this.state, fileTree: structure})
  }

  deleteItem(path: string) {
    // Split the path into an array
    const pathArray: string[] = path.split('/')
    let filename: string = ""

    // If the selected item is not a directory, remove one item from the pathArray
    if (!this.isDirectory(pathArray)) {
      filename = pathArray.pop() !
    }

    let structure = _cloneDeep(this.state.fileTree)
    let unsulliedStructure = _cloneDeep(this.state.fileTree)

    structure = this.traverseDirectoryModify(
      structure,
      pathArray,
      1,
      pathArray.length,
      (structure) => {
        if (filename) {
          structure.files = structure.files.reduce((acc: any[], cur: any) => {
            if (cur.label !== filename) {
              acc.push(cur)
            }

            return acc
          }, [])

          console.log(structure)
          return structure
        } else {
          const oldDirName:string = pathArray.pop()!
          const newStructure = _cloneDeep(structure)

          structure = this.traverseDirectoryModify(
            unsulliedStructure,
            pathArray,
            1,
            pathArray.length,
            (structure) => {
              console.log(structure)
              delete structure[oldDirName]

              return structure
            }
          )

          this.setState({...this.state, fileTree: structure})
        }
      }
    )

    if (filename !== "") {
      this.setState({...this.state, fileTree: structure})
    }
  }

  // This handles the context menu click for Rename, toggling the input in the file tree
  toggleItemInput(path: string) {
    // Split the path into an array
    const pathArray = path.split('/')
    let filename: string = ""

    // If the selected item is not a directory, remove one item from the pathArray
    if (!this.isDirectory(pathArray)) {
      filename = pathArray.pop() !
    }

    // Deep clone the structure so we're not working on the state file tree
    let structure = _cloneDeep(this.state.fileTree)

    // By using a function like this we can re-use the traverseDirectoryModify method for other purposes
    const toggle = function(structure: any) {
      if (filename) {
        console.log(filename, structure)
        structure.files = structure.files.map((file: any) => {
          if (file.label === filename) {
            file.input = !file.input
          }
          
          return file
        })
      } else {
        structure.input = !structure.input
      }

      return structure
    }
    
    // Recursively iterate through the structure object and set the structure to its return value
    structure = this.traverseDirectoryModify(structure, pathArray, 1, pathArray.length, toggle)
    
    // Update state
    this.setState({...this.state, fileTree: structure})
  }

  // This handles the actual renaming
  renameItem(e: any, path: string, value: string) {
    // Split the path into an array
    const pathArray: string[] = path.split('/')
    let filename: string = ""

    // If the selected item is not a directory, remove one item from the pathArray
    if (!this.isDirectory(pathArray)) {
      filename = pathArray.pop() !
    }

    // Deep clone the structure so we're not working on the state file tree
    let structure = _cloneDeep(this.state.fileTree)
    let unsulliedStructure = _cloneDeep(this.state.fileTree)
    
    const isCreating = this.traverseDirectoryCheck(
      structure, 
      pathArray, 
      1,
      pathArray.length,
      (structure) => {
        if (filename) {
          return structure.files.map((file: any) => {
            if (file.label === filename) {
              return file.creating
            }
          }).pop()
        } else {
          return structure.creating
        }
      }
    )

    /**
     * If pressing ESC and key creating DOES exist: call deleteItem ()
     * If pressing ENTER and key creating DOES exist and input is EMPTY: call deleteItem()
     * If BLUR and key creating DOES exist and input is EMPTY: call deleteItem()
     */
    if (
      (
        value === "" &&
        (
          e.key === 'Enter' ||
          e.type === 'blur'
        ) && isCreating
      ) || (
        e.key === 'Escape' && isCreating
      )

    ) {
      this.deleteItem(path)
      return
    }

    /**
     * If pressing ENTER and key creating DOES exist and input is NOT EMPTY:
     *  update name and remove key creating and set input to FALSE
     * 
     * If BLUR and key creating DOES exist and input is NOT EMPTY:
     *  update name and remove key creating and set input to FALSE
     * 
     * If pressing ENTER and key creating DOES NOT exist and input is NOT EMPTY:
     *  update name and set input to FALSE
     * 
     * If BLUR and key creating DOES NOT exist and input is NOT EMPTY:
     *  update name and set input to FALSE
     * 
     * If pressing ESC and key creating DOES NOT exist: revert to old name and set input to FALSE
     * 
     * If pressing ENTER and key creating DOES NOT exist and input is EMPTY:
     *  revert to old name and set input to FALSE
     * 
     * If BLUR and key creating DOES NOT exist and input is EMPTY:
     *  revert to old name and set input to FALSE
     */

    else if (e.key === 'Enter' || e.key === 'Escape' || e.type === 'blur') {
      structure = this.traverseDirectoryModify(
        structure,
        pathArray,
        1,
        pathArray.length,
        (structure) => {
          if (filename) {
            structure.files = structure.files.map((file: any) => {
              console.log(file)
              if (file.label === filename) {
                file.input = false

                if (isCreating) {
                  delete file.creating
                }

                if (value !== "" && e.key !== 'Escape') {
                  file.label = value
                }
              }

              return file
            })

            return structure
          } else {
            const oldDirName:string = pathArray.pop()!

            structure.input = false

            if (value === "" && e.key === 'Escape') {
              return structure
            }
            
            if (isCreating) {
              delete structure.creating
            }

            if (e.key !== 'Escape') {
              const newStructure = _cloneDeep(structure)
              
              structure = this.traverseDirectoryModify(
                unsulliedStructure,
                pathArray,
                1,
                pathArray.length,
                (structure) => {
                  console.log(structure)
                  delete structure[oldDirName]
                  structure[value] = newStructure

                  return structure
                }
              )

              this.setState({...this.state, fileTree: structure})
            } else {
              return structure
            }
          }
        }
      )

      if (filename !== "" || value === "" || e.key === 'Escape') {
        this.setState({...this.state, fileTree: structure})
      }
    }
  }

  // For the FileTree layout; toggle whether a directory is open or closed
  toggleDirectory(directoryPath: string) {
    // Split the path into an array
    const pathArray = directoryPath.split('/')

    // Deep clone the structure so we're not working on the state file tree
    let structure = _cloneDeep(this.state.fileTree)

    // By using a function like this we can re-use the traverseDirectoryModify method for other purposes
    const toggle = function(structure: any) { structure.open = !structure.open; return structure }
    
    // Recursively iterate through the structure object and set the structure to its return value
    structure = this.traverseDirectoryModify(structure, pathArray, 1, pathArray.length, toggle)
    
    // Update state
    this.setState({...this.state, fileTree: structure})
  }

  render() {
    return (
        // <FileView
        //   viewType={this.state.viewType}
        //   currentPath={this.state.currentPath}
        //   fileTree={this.state.fileTree}
        //   changePath={this.changePath}
        // />
      <div>
        <FileTree
          fileTree={this.state.fileTree}
          toggleDirectory={this.toggleDirectory}
          renameItem={this.renameItem}
        />

        <ContextMenu handleContextMenu={this.handleContextMenu} />
      </div>
    )
  }
}

ReactDom.render(<App />, mainElement);