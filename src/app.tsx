import React, { Component } from 'react';
import ReactDom from 'react-dom';

import FileView from './components/FileView'
import FileTree from './components/FileTree';
import ContextMenu from './components/ContextMenu'

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

  /**
   * Method to recursively traverse the structure object and modify it on a certain level
   * based on a path
   */
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
  
  /**
   * Method to recursively traverse the structure object and check a value on a certain level
   * based on a path.
   */
  traverseDirectoryCheck(structure:any, pathArray: string[], i: number, end: number, callback: (structure: any) => any): any {
    // If we've reached the end
    if (i >= end) {
      // Call the callback method and return its value
      return callback(structure)
    }

    // If we've not reached the end, traverse further down the structure/ file tree
    return this.traverseDirectoryCheck(structure[pathArray[i]], pathArray, i + 1, pathArray.length, callback)
  }

  /**
   * Check if current path leads to a directory
   */
  isDirectory(pathArray: string[]): boolean {
    let structure = _cloneDeep(this.state.fileTree)

    const hasOpen = (structure: any): boolean => {
      // If open exists, it's a directory. Otherwise it's a file
      return structure?.open !== undefined
    }

    return this.traverseDirectoryCheck(structure, pathArray, 1, pathArray.length, hasOpen)
  }

  /**
   * Add a file to path
   * @param path path to where to add the file
   */
  addFile(path: string): void {
    this.addItem(path, 'file')
  }

  /**
   * Add a directory to path
   * @param path path to where to add the directory
   */
  addDirectory(path: string) {
    this.addItem(path, 'dir')
  }

  /**
   * Add an item to the structure based on path
   * @param path path to where to add the item
   * @param type type of item (dir | file)
   */
  addItem(path: string, type: string) {
    // Split the path into an array
    const pathArray = path.split('/')

    // If the selected item is not a directory, remove one item from the pathArray
    if (!this.isDirectory(pathArray)) {
      pathArray.pop();
    }

    // Deep clone the structure so we're not working on the state file tree
    let structure = _cloneDeep(this.state.fileTree)

    // callback function for traverseDirectoryModify()
    const add = function(structure: any) {
      if (structure.open !== undefined) {
        structure.open = true
      }

      if (type === 'dir') {
        structure['New Directory'] = { open: false, input: true, creating: true, files: [] }
      } else {
        structure['files'].push({label: "New File", input: true, creating: true})
      }

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

    // Because we are doing a traversal inside of a traversal, we're going to need
    // a second file tree object that we can use, that's unaffected by the first
    // traversal
    let unsulliedStructure = _cloneDeep(this.state.fileTree)

    // Recursively iterate through the structure object and set the structure to its return value
    structure = this.traverseDirectoryModify(structure, pathArray, 1, pathArray.length, (structure) => {
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
        structure = this.traverseDirectoryModify(unsulliedStructure, pathArray, 1, pathArray.length, (structure) => {
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
   * This handles the context menu click for Rename, toggling the input in the file tree
   */
  toggleItemInput(path: string) {
    // Split the path into an array
    const pathArray = path.split('/')
    let filename: string = ""

    // If the selected item is not a directory, remove last item from the pathArray
    // and assign its value to a variable
    if (!this.isDirectory(pathArray)) {
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
    structure = this.traverseDirectoryModify(structure, pathArray, 1, pathArray.length, toggle)
    
    // Update state
    this.setState({...this.state, fileTree: structure})
  }

  /**
   * This handles the actual renaming
   */
  renameItem(e: any, path: string, value: string) {
    // Split the path into an array
    const pathArray: string[] = path.split('/')
    let filename: string = ""

    // If the selected item is not a directory, remove one item from the pathArray
    // and assign it to a variable
    if (!this.isDirectory(pathArray)) {
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
    const isCreating = this.traverseDirectoryCheck(structure, pathArray, 1, pathArray.length, (structure) => {
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

    /**
     * If pressing ESC and key creating DOES exist: call deleteItem ()
     * If pressing ENTER and key creating DOES exist and input is EMPTY: call deleteItem()
     * If BLUR and key creating DOES exist and input is EMPTY: call deleteItem()
     */
    if (
      (value === "" && (e.key === 'Enter' || e.type === 'blur') && isCreating) ||
      (e.key === 'Escape' && isCreating)
    ) {
      this.deleteItem(path)
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
      structure = this.traverseDirectoryModify(structure, pathArray, 1, pathArray.length, (structure) => {
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
            structure = this.traverseDirectoryModify(unsulliedStructure, pathArray, 1, pathArray.length, (structure) => {
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