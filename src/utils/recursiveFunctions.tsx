/**
 * Method to recursively traverse the structure object and modify it on a certain level
 * based on a path
 */
export function traverseDirectoryModify(structure:any, pathArray: string[], i: number, end: number, callback: (structure: any) => any) {
  // If we've reached the end
  if (i >= end) {
    // Call the callback method, update the structure, and return it
    structure = callback(structure)
    return structure
  }

  // If we've not reached the end, traverse further down the structure/ file tree
  structure[pathArray[i]] = traverseDirectoryModify(structure[pathArray[i]], pathArray, i + 1, end, callback)
  return structure
}

/**
 * Method to recursively traverse the structure object and check/ get a value on a certain level
 * based on a path.
 */
export function traverseDirectoryCheck(structure:any, pathArray: string[], i: number, end: number, callback: (structure: any) => any): any {
  // If we've reached the end
  if (i >= end) {
    // Call the callback method and return its value
    return callback(structure)
  }

  // If we've not reached the end, traverse further down the structure/ file tree
  return traverseDirectoryCheck(structure[pathArray[i]], pathArray, i + 1, end, callback)
}