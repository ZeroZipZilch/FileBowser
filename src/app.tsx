import React, { Component } from 'react';
import ReactDom from 'react-dom';

import FileView from './components/FileView'
import FileTree from './components/FileTree';
import ContextMenu from './components/ContextMenu'

import { traverseDirectoryCheck, traverseDirectoryModify } from './utils/recursiveFunctions'

const _cloneDeep = require('lodash/cloneDeep')

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

interface Props {}

interface State {
  fileTree: {}
  currentPath: string
  contextPath: string
  draggingPath: string // Dragging path
  draggingType: string // file or dir
  hoveringPath: string // Hovering path
  hoveringType: string // file or dir
  viewType: string // tree, windows explorer
}

class App extends Component<Props, State> {
  constructor(props: any) {
    super(props)

    this.state = {
      fileTree: {},
      currentPath: '/', // For the FileView layout
      contextPath: '',
      viewType: 'explorer',
      draggingPath: "",
      draggingType: "",
      hoveringPath: "",
      hoveringType: "",
    }

    this.changePath = this.changePath.bind(this)
    this.toggleDirectory = this.toggleDirectory.bind(this)
    this.handleContextMenu = this.handleContextMenu.bind(this)
    this.renameItem = this.renameItem.bind(this)
    this.moveItem = this.moveItem.bind(this)
    this.setDraggingPath = this.setDraggingPath.bind(this)
    this.setHoveringPath = this.setHoveringPath.bind(this)
    this.resetDragPaths = this.resetDragPaths.bind(this)
    this.toggleView = this.toggleView.bind(this)
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
          structureObject['files'].push({ label: currentItem, input: false })

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

  setDraggingPath(to: string, type: string) {
    this.setState({...this.state, draggingPath: to, draggingType: type})
  }

  setHoveringPath(to: string, type: string) {
    this.setState({...this.state, hoveringPath: to, hoveringType: type})
  }

  // We have to do both draggingPath and hoveringPath at the same time, or the latter will overwrite
  // the former before setState is successfully called
  resetDragPaths() {
    this.setState({...this.state, draggingPath: "", draggingType: "", hoveringPath: "", hoveringType: ""})
  }

  // This is for the explorer view
  changePath(to: string) {
    this.setState({...this.state, currentPath: to})
  }

  handleContextMenu(option: string, path: string, pathType: string) {
    switch (option) {
      case "contextAddFile":
        this.addFile(path, pathType)
        break;
      case "contextAddDir":
        this.addDirectory(path, pathType)
        break;
      case "contextDelete":
        this.deleteItem(path, pathType)
        break;
      case "contextRename":
        this.toggleItemInput(path, pathType)
        break;
    }
  }

  /**
   * Removes empty "" entries from the path array
   */
  cleanPathArray(pathArray: string[]): string[] {
    return pathArray.reduce((acc: string[], cur: string) => {
      if (cur !== "") {
        acc.push(cur)
      }

      return acc
    }, [])
  }

  /**
   * Add a file to path
   * @param path path to where to add the file
   * @param pathType did we rightclick a file or dir?
   */
  addFile(path: string, pathType: string): void {
    this.addItem(path, 'file', pathType)
  }

  /**
   * Add a directory to path
   * @param path path to where to add the directory
   * @param pathType did we rightclick a file or dir?
   */
  addDirectory(path: string, pathType: string) {
    this.addItem(path, 'dir', pathType)
  }

  /**
   * Add an item to the structure based on path
   * @param path path to where to add the item
   * @param itemType type of item (dir | file)
   * @param pathType did we rightclick a file or dir?
   */
  addItem(path: string, itemType: string, pathType: string) {
    // Split the path into an array
    let pathArray

    if (this.state.viewType === 'tree') {
      pathArray = path.split('/')
    } else {
      pathArray = this.state.currentPath.split('/')
    }

    pathArray = this.cleanPathArray(pathArray)

    // If the selected item is a file, remove one item from the pathArray
    if (pathType === 'file') {
      pathArray.pop();
    }

    // Deep clone the structure so we're not working on the state file tree
    let structure = _cloneDeep(this.state.fileTree)

    // callback function for traverseDirectoryModify()
    const add = function(structure: any) {
      if (structure.open !== undefined) {
        structure.open = true
      }

      if (itemType === 'dir') {
        structure['New Directory'] = { open: false, input: true, creating: true, files: [] }
      } else {
        structure['files'].push({label: "New File", input: true, creating: true})
      }

      return structure
    }

    // Recursively iterate through the structure object and set the structure to its return value
    structure = traverseDirectoryModify(structure, pathArray, 0, pathArray.length, add)

    // Update state
    this.setState({...this.state, fileTree: structure})
  }

  deleteItem(path: string, pathType: string) {
    // Split the path into an array
    const pathArray: string[] = path.split('/')
    let filename: string = ""

    // If the selected item is not a directory, remove one item from the pathArray
    if (pathType === 'file') {
      filename = pathArray.pop() !
    }

    let structure = _cloneDeep(this.state.fileTree)

    // Because we are doing a traversal inside of a traversal, we're going to need
    // a second file tree object that we can use, that's unaffected by the first
    // traversal
    let unsulliedStructure = _cloneDeep(this.state.fileTree)

    // Recursively iterate through the structure object and set the structure to its return value
    structure = traverseDirectoryModify(structure, pathArray, 1, pathArray.length, (structure) => {
      // If filename has a value it means we are dealing with a file
      if (filename) {
        // Create a new files array with all files except the file we want to delete
        // and assign it to the structure files[]
        structure.files = structure.files.reduce((acc: any[], cur: any) => {
          if (cur.label !== filename) {
            acc.push(cur)
          }

          return acc
        }, [])

        return structure
      } else {
        // If we get here we are dealing with a directory

        // We want to access the parent directory (and we want to save the dir name of the dir
        // we chose to delete)
        const oldDirName:string = pathArray.pop()!

        // We are going to traverse the file tree again, this time to the parent directory
        // When there, we delete the directory that we have selected.
        // We start with a full file tree and go down the path. Then we return that structure
        structure = traverseDirectoryModify(unsulliedStructure, pathArray, 1, pathArray.length, (structure) => {
          delete structure[oldDirName]

          return structure
        })

        // we update the state here, because we want the structure of this iteration to be
        // the file tree
        this.setState({...this.state, fileTree: structure})
      }
    })

    // Otherwise, if we get here, we update the state assuming that we were dealing with a file
    // This is because for a file, we want the first level of recursion to be the "head" of the
    // file tree
    if (filename !== "") {
      this.setState({...this.state, fileTree: structure})
    }
  }

  /**
   * This handles the context menu click for Rename, toggling the input field in the file tree
   */
  toggleItemInput(path: string, pathType: string) {
    // Split the path into an array
    const pathArray = path.split('/')
    let filename: string = ""

    // If the selected item is not a directory, remove last item from the pathArray
    // and assign its value to a variable
    if (pathType === 'file') {
      filename = pathArray.pop() !
    }

    // Deep clone the structure so we're not working on the state file tree
    let structure = _cloneDeep(this.state.fileTree)

    // callback function for traverseDirectoryModify()
    const toggle = function(structure: any) {
      if (filename) {
        // If we are dealing with a file, iterate over the files array
        // and when file.label == filename, toggle the input for it
        structure.files = structure.files.map((file: any) => {
          if (file.label === filename) {
            file.input = !file.input
          }

          return file
        })
      } else {
        // Otherwise it's a directory. Simply toggle the input
        structure.input = !structure.input
      }

      return structure
    }
    
    // Recursively iterate through the structure object and set the structure to its return value
    structure = traverseDirectoryModify(structure, pathArray, 1, pathArray.length, toggle)
    
    // Update state
    this.setState({...this.state, fileTree: structure})
  }

  /**
   * This handles the actual renaming
   */
  renameItem(e: any, path: string, value: string, pathType: string) {
    // Split the path into an array
    const pathArray: string[] = this.cleanPathArray(path.split('/'))
    let filename: string = ""

    // If the selected item is not a directory, remove one item from the pathArray
    // and assign it to a variable
    if (pathType === 'file') {
      filename = pathArray.pop() !
    }

    // Deep clone the structure so we're not working on the state file tree
    let structure = _cloneDeep(this.state.fileTree)

    // Because we are doing a traversal inside of a traversal, we're going to need
    // a second file tree object that we can use, that's unaffected by the first
    // traversal
    let unsulliedStructure = _cloneDeep(this.state.fileTree)
    
    // Check to see if we are currently creating the file or directory being renamed
    // We check this because when an item is created, it's given this key.
    const isCreating = traverseDirectoryCheck(structure, pathArray, 0, pathArray.length, (structure) => {
      // If filename exists, we are dealing with a file
      if (filename) {
        // Return file.creating for the last file in the files array.
        // file.creating will either not exist or be true. Since it's an array,
        // it will always be the last item in the files array if it exists
        return structure.files[structure.files.length - 1].creating
      } else {
        // If we get here we're in a directory
        // Return structure.creating for that directory.
        // It will either not exist or be true
        return structure.creating
      }
    })

    const paLength = pathType === 'dir' ? pathArray.length - 1 : pathArray.length
    
    traverseDirectoryCheck(structure, pathArray, 0, paLength, (structure) => {
      let safeValue = value
      let valueIndex = 0

      // while (structure[value] !== undefined) {
      //   // While a directory exists with the given name
      //   // Append a number to it
      //   valueIndex += 1
      //   value = `${safeValue} (${valueIndex})`
      // }

      while (true) {
        let stillDuplicate
        
        stillDuplicate = structure.files.reduce((acc: boolean, cur: any) => {
          if(cur.label === value) acc = true
          return acc
        }, false)

        if (stillDuplicate === false) {
          stillDuplicate = structure[value] !== undefined
        }
        
        if (!stillDuplicate) break

        // While a file exists with the given name
        // Append a number to it
        valueIndex += 1
        value = `${safeValue} (${valueIndex})`
      }
    })

    /**
     * If pressing ESC and key creating DOES exist: call deleteItem ()
     * If pressing ENTER and key creating DOES exist and input is EMPTY: call deleteItem()
     * If BLUR and key creating DOES exist and input is EMPTY: call deleteItem()
     */
    if (
      (value === "" && (e.key === 'Enter' || e.type === 'blur') && isCreating) ||
      (e.key === 'Escape' && isCreating)
    ) {
      this.deleteItem(path, pathType)
      return // Return because we don't want to go past this point. Just a precaution.
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
      structure = traverseDirectoryModify(structure, pathArray, 0, pathArray.length, (structure) => {
        // If filename exists we are dealing with a file
        if (filename) {
          // Create a new files array by iterating over the existing one,
          // and assign it to the existing one
          structure.files = structure.files.map((file: any) => {
            // if the current file label equals the filename we have selected,
            // make changes
            if (file.label === filename) {
              file.input = false

              // If the file is being created, we want to delete this key when the filename
              // has been changed, because it's no longer a new file
              if (isCreating) {
                delete file.creating
              }

              // If the value is empty or the user presses Escape, we don't change
              // the filename, AKA we skip this section
              if (value !== "" && e.key !== 'Escape') {
                file.label = value
              }
            }

            return file
          })

          return structure
        } else {
          // If we get here, we are dealing with a directory

          // We want to access the parent directory, so we assign the directory name to a
          // variable and pop it from the pathArray
          const oldDirName:string = pathArray.pop()!

          structure.input = false

          // If the new directory name is empty, or if the user presses Escape on the keyboard,
          // there's nothing more to it. We can return here.
          if (value === "" && e.key === 'Escape') {
            return structure
          }
          
          // If the directory is being created, we want to delete this key when the directory name
          // has been changed, because it's no longer a new directory
          if (isCreating) {
            delete structure.creating
          }

          // If this returns false it means Escape was pressed, but the value was not Empty.
          if (e.key !== 'Escape') {
            // Let's clone the structure again. This time we want to clone the structure
            // of our current level of recursion. This is probably overkill and could be
            // circumvented
            const newStructure = _cloneDeep(structure)
            
            // Then we traverse down the file tree, again. This time to the parent directory
            // (remember we popped the pathArray earlier?)
            structure = traverseDirectoryModify(unsulliedStructure, pathArray, 0, pathArray.length, (structure) => {
              // Here we delete the key with the old directory name, and we assign
              // its values to a key with the new directory name.
              delete structure[oldDirName]
              structure[value] = newStructure

              return structure
            })

            // Then we assign this new structure to the fileTree in state. We do this here,
            // because we want this second level of recursion to be the "head" of the file tree
            this.setState({...this.state, fileTree: structure})
          } else {
            // And if Escape was pressed, we simply return the structure without further
            // modifications. That'd mean we return it with a structure.input = false and
            // nothign else
            return structure
          }
        }
      })

      // And here... If the state hasn't already been set above, we set it here
      if (filename !== "" || value === "" || e.key === 'Escape') {
        this.setState({...this.state, fileTree: structure})
      }
    }
  }

  moveItem() {
    const { draggingPath, draggingType, hoveringPath, hoveringType } = this.state

    const copyPathArray = this.cleanPathArray(draggingPath.split("/"))
    const movePathArray = this.cleanPathArray(hoveringPath.split("/"))

    let filename = ""
    
    let copyStructure = _cloneDeep(this.state.fileTree)
    let structure = _cloneDeep(this.state.fileTree)

    if (draggingType === 'file') {
      filename = copyPathArray.pop() !
    }

    // If we drop on a file, we want to move to the directory of that file
    if (hoveringType === 'file') {
      movePathArray.pop() !
    }

    let isMovingParentToChild = false
    
    if (filename === "") {
      // Make sure we aren't moving a parent directory to a child directory
      // This also ensures we don't go any further if we are trying to
      // move a directory to itself
      isMovingParentToChild = movePathArray.reduce((acc: boolean, cur: string) => {
        if (copyPathArray[copyPathArray.length - 1] === cur) {
          acc = true
        }

        return acc
      }, false)
    }

    if (draggingPath !== "" && hoveringPath !== "" && draggingPath !== hoveringPath && !isMovingParentToChild) {
      let copyDir: string = ""
      
      // If it's not a file, we're dealing with a directory
      if (filename === "") {
        copyStructure = traverseDirectoryCheck(copyStructure, copyPathArray, 0, copyPathArray.length, (structure) => {
          // Get the name of the directory, and pop it from the pathArray so we can work on the 
          // parent level further down
          copyDir = copyPathArray.pop() !

          return structure
        })

        // If it's not a file, let's delete the entire directory
        structure = traverseDirectoryModify(structure, copyPathArray, 0, copyPathArray.length, (structure) => {
          delete structure[copyDir]

          return structure
        })

      } else {
        // If it's a file that we're copying, we don't really need to copy the entire directory
        // We do however need to remove the file if it's not a directory
        structure = traverseDirectoryModify(copyStructure, copyPathArray, 0, copyPathArray.length, (structure) => {
          structure['files'] = structure['files'].reduce((acc: any[], cur: any) => {
            if (cur.label !== filename) {
              acc.push(cur)
            }

            return acc
          }, [])
          return structure
        })
      }

      structure = traverseDirectoryModify(structure, movePathArray, 0, movePathArray.length, (structure) => {
        // If we are moving a directory, we create a new directory at the destination and "paste it"
        let value = ""
        if (filename === "") {
          value = copyDir
        } else {
          value = filename
        }

        // If the directory already exists
        // Append a number to it
        let safeValue = value
        let valueIndex = 0
        
        while (true) {
          let stillDuplicate
      
          stillDuplicate = structure.files.reduce((acc: boolean, cur: any) => {
            if(cur.label === value) acc = true
            return acc
          }, false)

          if (stillDuplicate === false) {
            stillDuplicate = structure[value] !== undefined
          }
          
          if (!stillDuplicate) break

          valueIndex += 1
          value = `${safeValue} (${valueIndex})`
        } 
        
        if (filename === "") {
          structure[value] = copyStructure
        } else { // If dealing with a file, push it to the destination files array
          structure.files.push({ label: value, input: false })
        }

        return structure
      })

      this.setState({ ...this.state, fileTree: structure, draggingPath: "", hoveringPath: "" })
      
    } else {
      this.resetDragPaths()
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
    structure = traverseDirectoryModify(structure, pathArray, 1, pathArray.length, toggle)
    
    // Update state
    this.setState({...this.state, fileTree: structure})
  }

  dragOver(e: any) {
    e.preventDefault()

    // Set the dropEffect to move
    e.dataTransfer.dropEffect = "move"
  }

  toggleView() {
    if (this.state.viewType === 'explorer') {
      this.setState({...this.state, viewType: 'tree'})
    } else {
      this.setState({...this.state, viewType: 'explorer'})
    }
  }

  render() {
    const toggleButtonStyle = {
      borderRadius: "2%",
      border: "2px solid #9a9a9a",
      background: "#3a3a3a",
      color: "#fafafa",
      padding: "0.3em",
      margin: "0.5em 0",
      cursor: "pointer",
      textAlign: "center" as 'center', // as 'center' just to prevent a typescript error. Idk tbh..
    }

    return (
      <div
        style={{
          background: "#232323",
          color: "#fafafa",
          padding: "1em",
          width: "100%",
          minHeight: "100vh",
          fontFamily: 'Verdana',
          fontSize: '14px',
          boxSizing: 'border-box',
        }}
        onDragOver={this.dragOver}
      >
        {this.state.viewType === 'explorer' ?
          <div style={toggleButtonStyle} onClick={this.toggleView}>Change to Tree View</div> :
          <div style={toggleButtonStyle} onClick={this.toggleView}>Change to Explorer View</div>}

        <div style={{height: '2px', width: '100%', background: "#3a3a3a", marginBottom: '1em'}} />
        
        {this.state.viewType === 'explorer' ? <FileView
          currentPath={this.state.currentPath}
          fileTree={this.state.fileTree}
          draggingPath={this.state.draggingPath}
          hoveringPath={this.state.hoveringPath}
          changePath={this.changePath}
          renameItem={this.renameItem}
          moveItem={this.moveItem}
          setDraggingPath={this.setDraggingPath}
          setHoveringPath={this.setHoveringPath}
          resetDragPaths={this.resetDragPaths}
        /> :
        <FileTree
          fileTree={this.state.fileTree}
          draggingPath={this.state.draggingPath}
          hoveringPath={this.state.hoveringPath}
          toggleDirectory={this.toggleDirectory}
          renameItem={this.renameItem}
          moveItem={this.moveItem}
          setDraggingPath={this.setDraggingPath}
          setHoveringPath={this.setHoveringPath}
          resetDragPaths={this.resetDragPaths}
        />}

        <ContextMenu
          viewType={this.state.viewType}
          currentPath={this.state.currentPath}
          handleContextMenu={this.handleContextMenu}
        />

        <div id="dragImageNode"
        style={{
          position: "absolute",
          top: "-100px",
          background: "#1256AC",
          color: "#1256AC",
          height: "80px",
          width: "80px",
          borderRadius: "2%",
        }} />
      </div>
    )
  }
}

ReactDom.render(<App />, mainElement);