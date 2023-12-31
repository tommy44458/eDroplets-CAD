/* eslint-disable eqeqeq */
import types from '@/store/types'
import newElectrodeUnit from '@/factories/electrodeUnitFactory'
import componentFactory from '@/factories/componentFactory'
import { setElId, getChildNode, calcRelativePoint } from '@/helpers/recursiveMethods'
import { fixElementToParentBounds, getComputedProp } from '@/helpers/positionDimension'

// const mergeElementsGroups = []

// const refreshMergeElements = function (state, commit) {
//   mergeElementsGroups.forEach(group => {
//     group.forEach(el => {
//       commit(types.updateElement, {
//         egglement: el,
//         height: 21,
//         width: 21
//       })

//       let tMax = true
//       let lMax = true

//       group.forEach(el2 => {
//         if (el2.left === el.left && el2.top > el.top) {
//           tMax = false
//         }
//         if (el2.top === el.top && el2.left > el.left) {
//           lMax = false
//         }
//       })

//       if (tMax) {
//         commit(types.updateElement, {
//           egglement: el,
//           height: 20
//         })
//       }
//       if (lMax) {
//         commit(types.updateElement, {
//           egglement: el,
//           width: 20
//         })
//       }
//     })
//   })
// }

// const isExistMergeGroup = function (_el) {
//   let isExist = false
//   mergeElementsGroups.forEach(group => {
//     group.forEach(el => {
//       if (el.id == _el.id) {
//         isExist = true
//       }
//     })
//   })
//   return isExist
// }

const elementActions = {
/**
 * Register the element (and any childElement contained on it),
 * under the pageId and saves it as a new child on the page.
 *
 * If the element is a componegg and is added as global (payload.global),
 * or if the componegg is external (due dependencies), the "component reference" will be saved
 * in the state.project.components array (global component references),
 * and a "component instance" will be registered and saved.
 *
 * (This action assumes that the element is being added to a page)
 *
 * @param {string} payload.pageId : Id of the page where the element is being added
 * @param {object} payload.el : The element that will be added to the page
 * @param {object} payload.global : Whether the component will be added as global or in-line
 *
 * @see {@link [types.createEgglement]}
 */
  [types.registerElement]: function ({ state, getters, commit }, payload) {
    let parent = getters.getPageById(payload.pageId)
    let el = payload.el
    if (el.componegg) {
      if (payload.global) {
        el = componentFactory.compInst(payload.el)
        if (!getters.componentExist(el.name)) {
          let componentRef = componentFactory.compRef(payload.el)
          commit(types._saveComponentRef, setElId(componentRef))
        } else {
          let compIndex = getters.getComponentRefIndexByName(el.name)
          let newCount = getters.getComponentRefByIndex(compIndex).usageCount + 1
          commit(types._updateComponentRef, {compIndex, newCount})
        }
      } else if (el.external) {
        // In case the componegg is from a external library...
        if (!getters.componentExist(el.name)) {
          let componentRef = componentFactory.compRef(payload.el)
          commit(types._saveComponentRef, setElId(componentRef))
        } else {
          let compIndex = getters.getComponentRefIndexByName(el.name)
          let newCount = getters.getComponentRefByIndex(compIndex).usageCount + 1
          commit(types._updateComponentRef, {compIndex, newCount})
        }
      }
    }

    let egglement = setElId(el, payload.pageId)
    commit(types.createEgglement, {parent, egglement})

    return egglement
  },

/**
 * Removes the egglement identified by payload.elId from the
 * page (payload.pageId). Notice that the element to remove
 * may not necessarily be a direct children of the page, but sub-(n)-children.
 *
 * @param {string} payload.page : The page where the element exist
 * @param {string} payload.elId : Id of the element to be updated
 * @see {@link [types.deleteEgglement]}
 */
  [types.removeElement]: function ({ getters, commit }, payload) {
    commit(types._clearSelectedElements)

    let parentId = payload.elId.substring(0, payload.elId.lastIndexOf('.'))
    let parent = getChildNode(payload.page, parentId)
    let eggIndex = parent.children.findIndex(egg => egg.id === payload.elId)

    let element = parent.children[eggIndex]

    if (element.componegg) {
      if (element.global || element.external) {
        let compIndex = getters.getComponentRefIndexByName(element.name)
        let count = getters.getComponentRefByIndex(compIndex).usageCount

        count > 1
          ? commit(types._updateComponentRef, {compIndex, newCount: count - 1})
          : commit(types._removeComponentRef, compIndex)
      }
    }
    commit(types.deleteEgglement, {parent, eggIndex})
  },

/**
 * Updates the element identified by payload.elId with the payload values
 *
 * @param {string} payload.pageId : Id of the page where the element reside
 * @param {string} payload.elId : Id of the element to be updated
 * @param {number} payload.left : New value for the element's left prop
 * @param {number} payload.top : New value for the element's top prop
 * @param {number} payload.height : New value for the element's height
 * @param {number} payload.width : New value for the element's width
 *
 * @see {@link [types.updateElement]}
 */
  [types.resizeElement]: function ({ getters, commit }, payload) {
    let page = getters.getPageById(payload.pageId)
    let egglement = getChildNode(page, payload.elId)

    if (
        payload.left !== egglement.left || payload.top !== egglement.top ||
        payload.right !== egglement.right || payload.bottom !== egglement.bottom ||
        payload.height !== egglement.height || payload.width !== egglement.width
      ) {
      commit(types.updateElement, {
        egglement,
        left: (egglement.left !== 'auto') ? payload.left : null,
        top: (egglement.top !== 'auto') ? payload.top : null,
        bottom: (egglement.bottom !== 'auto') ? payload.bottom : null,
        right: (egglement.right !== 'auto') ? payload.right : null,
        height: (egglement.height !== 'auto') ? payload.height : null,
        width: (egglement.width !== 'auto') ? payload.width : null
      })
    }
  },

/**
 * If payload.parentId != null, meaning that the moved element
 * has been dropped in a new container, the element will change its family.
 *
 * If payload.parentId == null the position of the element
 * identified by payload.elId will be updated.
 *
 * @param {string} payload.pageId : Id of the page where the element exits
 * @param {string} payload.elId : Id of the element to be updated
 * @param {number} payload.left : New value for the element's left prop
 * @param {number} payload.top : New value for the element's top prop
 * @param {number} payload.mouseX : Global mouse position for left axis
 * @param {number} payload.mouseY : Global mouse position for top axis
 * @param {string|null} [payload.parentId] : Id of the container where the element has been dropped
 *
 * @see {@link [types.changeElementParent]}
 * @see {@link [types.updateElement]}
 */
  [types.moveElement]: function ({ getters, dispatch, commit }, payload) {
    let page = getters.getPageById(payload.pageId)
    let egglement = getChildNode(page, payload.elId)

    if (payload.parentId) {
      dispatch(types.changeElementParent, {...payload, page, egglement})
    } else if (payload.left !== egglement.left || payload.top !== egglement.top) {
      commit(types.updateElement, {
        egglement,
        left: (egglement.left !== 'auto') ? payload.left : null,
        top: (egglement.top !== 'auto') ? payload.top : null,
        bottom: (egglement.bottom !== 'auto') ? payload.bottom : null,
        right: (egglement.right !== 'auto') ? payload.right : null
      })
    }
  },

/**
 * Changes the payload.egglement to another family:
 * First removes the egglement from the children array of it's current (old) parent.
 * Registers the egglement with the ids of its new family and created as new child
 * on its new parent. After this process, its position/size gets updated.
 *
 * @param {string} payload.pageId : Id of the page where the element exist
 * @param {string} payload.elId : Id of the element to be updated
 * @param {number} payload.left : New value for the element's left prop
 * @param {number} payload.top : New value for the element's top prop
 * @param {number} payload.mouseX : Global mouse position for left axis
 * @param {number} payload.mouseY : Global mouse position for top axis
 * @param {string} payload.parentId : Id of the container where the element has been dropped
 *
 * @see {@link [types.deleteEgglement]}
 * @see {@link [types.createEgglement]}
 * @see {@link [types.updateElement]}
 */
  [types.changeElementParent]: function ({ state, getters, commit }, payload) {
      // To avoid reference problems (the oldSelected element will be different)
    commit(types._clearSelectedElements)

    // Gets the computed dimensions before being take off the stage
    let height = getComputedProp('height', payload.egglement)
    let width = getComputedProp('width', payload.egglement)

      // OLD FAMILY business
    let oldParentId = payload.elId.substring(0, payload.elId.lastIndexOf('.'))
    let oldParent = getChildNode(payload.page, oldParentId)
    let childEggIndex = oldParent.children.findIndex(egg => egg.id === payload.egglement.id)

    commit(types.deleteEgglement, {parent: oldParent, eggIndex: childEggIndex})

      // NEW FAMILY business
    let newParent = getChildNode(payload.page, payload.parentId)
    payload.egglement = setElId(payload.egglement, payload.parentId)

    commit(types.createEgglement, {parent: newParent, egglement: payload.egglement})

      // Update relative position and dimensions of the element
    const relPoint = calcRelativePoint(payload.page, payload.egglement.id, payload.mouseX, payload.mouseY)

    let left = relPoint.left - (width / 2)
    let top = relPoint.top - (height / 2)

    const fixedProps = fixElementToParentBounds({top, left, height, width}, newParent)
    commit(types.updateElement, {
      ...fixedProps,
      egglement: payload.egglement,
      bottom: 'auto',
      right: 'auto'
    })
  },

  [types.margeSelectedElements]: async function ({ getters, commit, state, dispatch }, payload) {
    if (state.app.selectedElements.length < 2) {
      return false
    }

    await dispatch(types.separateElement)

    const unit = state.app.gridUnit.origin / 10
    const cornerSize = state.app.cornerSize
    const gapSize = state.app.gapSize
    commit(types.sortSelectedElement)

    let topMax = -1
    let leftMax = -1
    let topMin = 9999
    let leftMin = 9999

    state.app.selectedElements.forEach(el => {
      topMin = el.top < topMin ? el.top : topMin
      leftMin = el.left < leftMin ? el.left : leftMin
      topMax = el.top > topMax ? el.top : topMax
      leftMax = el.left > leftMax ? el.left : leftMax
    })

    const rowNumber = ((leftMax - leftMin) / unit) + 1
    const colNumber = ((topMax - topMin) / unit) + 1

    let firstElec = 9999

    const initMatrix = async function (rowNumber, colNumber) {
      const matrix = []

      for (let i = 0; i < colNumber; i++) {
        const row = []
        for (let j = 0; j < rowNumber; j++) {
          row.push(0)
        }
        matrix.push(row)
      }

      state.app.selectedElements.forEach(el => {
        const rowIndex = (el.left - leftMin) / unit
        const colIndex = (el.top - topMin) / unit
        matrix[colIndex][rowIndex] = 1
        if (colIndex == 0) {
          firstElec = firstElec < rowIndex ? firstElec : rowIndex
        }
      })

      return matrix
    }

    const matrix = await initMatrix(rowNumber, colNumber)
    const vertex = []
    const vArray = []

    const drewPathTop = async function (i, j, unit) {
      matrix[i][j] = -1

      if (matrix[i - 1] != null && matrix[i - 1][j] == 1) {
        await drewPathDown(i - 1, j, unit)
      } if (matrix[i - 1] != null && matrix[i - 1][j] == -1) {
      } else {
        vertex.push([((j * unit + 0)), ((i * unit + 0))])
        vertex.push([((j * unit + unit)), ((i * unit + 0))])
      }

      if (matrix[i][j + 1] != null && matrix[i][j + 1] == 1) {
        await drewPathLeft(i, j + 1, unit)
      } if (matrix[i][j + 1] != null && matrix[i][j + 1] == -1) {
      } else {
        vertex.push([((j * unit + unit)), ((i * unit + 0))])
        vertex.push([((j * unit + unit)), ((i * unit + unit))])
      }

      if (matrix[i + 1] != null && matrix[i + 1][j] == 1) {
        await drewPathTop(i + 1, j, unit)
      } if (matrix[i + 1] != null && matrix[i + 1][j] == -1) {
      } else {
        vertex.push([((j * unit + unit)), ((i * unit + unit))])
        vertex.push([((j * unit + 0)), ((i * unit + unit))])
      }

      if (matrix[i][j - 1] != null && matrix[i][j - 1] == 1) {
        await drewPathRight(i, j - 1, unit)
      } if (matrix[i][j - 1] != null && matrix[i][j - 1] == -1) {
      } else {
        vertex.push([((j * unit)), ((i * unit + unit))])
        vertex.push([((j * unit)), ((i * unit))])
      }
    }

    const drewPathRight = async function (i, j, unit) {
      matrix[i][j] = -1

      if (matrix[i][j + 1] != null && matrix[i][j + 1] == 1) {
        await drewPathLeft(i, j + 1, unit)
      } if (matrix[i][j + 1] != null && matrix[i][j + 1] == -1) {
      } else {
        vertex.push([((j * unit + unit)), ((i * unit + 0))])
        vertex.push([((j * unit + unit)), ((i * unit + unit))])
      }

      if (matrix[i + 1] != null && matrix[i + 1][j] == 1) {
        await drewPathTop(i + 1, j, unit)
      } if (matrix[i + 1] != null && matrix[i + 1][j] == -1) {
      } else {
        vertex.push([((j * unit + unit)), ((i * unit + unit))])
        vertex.push([((j * unit + 0)), ((i * unit + unit))])
      }

      if (matrix[i][j - 1] != null && matrix[i][j - 1] == 1) {
        await drewPathRight(i, j - 1, unit)
      } if (matrix[i][j - 1] != null && matrix[i][j - 1] == -1) {
      } else {
        vertex.push([((j * unit)), ((i * unit + unit))])
        vertex.push([((j * unit)), ((i * unit))])
      }

      if (matrix[i - 1] != null && matrix[i - 1][j] == 1) {
        await drewPathDown(i - 1, j, unit)
      } if (matrix[i - 1] != null && matrix[i - 1][j] == -1) {
      } else {
        vertex.push([((j * unit + 0)), ((i * unit + 0))])
        vertex.push([((j * unit + unit)), ((i * unit + 0))])
      }
    }

    const drewPathDown = async function (i, j, unit) {
      matrix[i][j] = -1

      if (matrix[i + 1] != null && matrix[i + 1][j] == 1) {
        await drewPathTop(i + 1, j, unit)
      } if (matrix[i + 1] != null && matrix[i + 1][j] == -1) {
      } else {
        vertex.push([((j * unit + unit)), ((i * unit + unit))])
        vertex.push([((j * unit + 0)), ((i * unit + unit))])
      }

      if (matrix[i][j - 1] != null && matrix[i][j - 1] == 1) {
        await drewPathRight(i, j - 1, unit)
      } if (matrix[i][j - 1] != null && matrix[i][j - 1] == -1) {
      } else {
        vertex.push([((j * unit)), ((i * unit + unit))])
        vertex.push([((j * unit)), ((i * unit))])
      }

      if (matrix[i - 1] != null && matrix[i - 1][j] == 1) {
        await drewPathDown(i - 1, j, unit)
      } if (matrix[i - 1] != null && matrix[i - 1][j] == -1) {
      } else {
        vertex.push([((j * unit + 0)), ((i * unit + 0))])
        vertex.push([((j * unit + unit)), ((i * unit + 0))])
      }

      if (matrix[i][j + 1] != null && matrix[i][j + 1] == 1) {
        await drewPathLeft(i, j + 1, unit)
      } if (matrix[i][j + 1] != null && matrix[i][j + 1] == -1) {
      } else {
        vertex.push([((j * unit + unit)), ((i * unit + 0))])
        vertex.push([((j * unit + unit)), ((i * unit + unit))])
      }
    }

    const drewPathLeft = async function (i, j, unit) {
      matrix[i][j] = -1

      if (matrix[i][j - 1] != null && matrix[i][j - 1] == 1) {
        await drewPathRight(i, j - 1, unit)
      } if (matrix[i][j - 1] != null && matrix[i][j - 1] == -1) {
      } else {
        vertex.push([((j * unit)), ((i * unit + unit))])
        vertex.push([((j * unit)), ((i * unit))])
      }

      if (matrix[i - 1] != null && matrix[i - 1][j] == 1) {
        await drewPathDown(i - 1, j, unit)
      } if (matrix[i - 1] != null && matrix[i - 1][j] == -1) {
      } else {
        vertex.push([((j * unit + 0)), ((i * unit + 0))])
        vertex.push([((j * unit + unit)), ((i * unit + 0))])
      }

      if (matrix[i][j + 1] != null && matrix[i][j + 1] == 1) {
        await drewPathLeft(i, j + 1, unit)
      } if (matrix[i][j + 1] != null && matrix[i][j + 1] == -1) {
      } else {
        vertex.push([((j * unit + unit)), ((i * unit + 0))])
        vertex.push([((j * unit + unit)), ((i * unit + unit))])
      }

      if (matrix[i + 1] != null && matrix[i + 1][j] == 1) {
        await drewPathTop(i + 1, j, unit)
      } if (matrix[i + 1] != null && matrix[i + 1][j] == -1) {
      } else {
        vertex.push([((j * unit + unit)), ((i * unit + unit))])
        vertex.push([((j * unit + 0)), ((i * unit + unit))])
      }
    }

    await drewPathLeft(0, firstElec, unit)

    let fault = false

    matrix.forEach(r => {
      r.forEach(i => {
        if (i == 1) {
          fault = true
        }
      })
    })

    if (fault) {
      return false
    }

    vertex.forEach((v, index) => {
      if (v.toString() != vertex[(index - 1 + vertex.length) % vertex.length].toString()) {
        vArray.push(v)
      }
    })

    // const dis = function (v1, v2) {
    //   const dx = Math.abs(v1[0] - v2[0])
    //   const dy = Math.abs(v1[1] - v2[1])
    //   return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
    // }

    const dArray = []

    // console.log(vArray)

    vArray.forEach((v, index) => {
      // dArray.push([v[0], v[1]])
      // external
      // .__
      // |
      if ((v[0] < vArray[(index + 1 + vArray.length) % vArray.length][0] && v[1] == vArray[(index + 1 + vArray.length) % vArray.length][1]) &&
           (v[0] == vArray[(index - 1 + vArray.length) % vArray.length][0]) && v[1] < vArray[(index - 1 + vArray.length) % vArray.length][1]) {
        dArray.push([v[0] + 0, v[1] + cornerSize])
        dArray.push([v[0] + cornerSize, v[1] + 0])
      }
      //  __.
      //    |
      if ((v[0] == vArray[(index + 1 + vArray.length) % vArray.length][0] && v[1] < vArray[(index + 1 + vArray.length) % vArray.length][1]) &&
           (v[0] > vArray[(index - 1 + vArray.length) % vArray.length][0]) && v[1] == vArray[(index - 1 + vArray.length) % vArray.length][1]) {
        dArray.push([v[0] - gapSize - cornerSize, v[1] + 0])
        dArray.push([v[0] + 0 - gapSize, v[1] + cornerSize])
      }
      //    |
      //  --.
      if ((v[0] > vArray[(index + 1 + vArray.length) % vArray.length][0] && v[1] == vArray[(index + 1 + vArray.length) % vArray.length][1]) &&
           (v[0] == vArray[(index - 1 + vArray.length) % vArray.length][0]) && v[1] > vArray[(index - 1 + vArray.length) % vArray.length][1]) {
        dArray.push([v[0] + 0 - gapSize, v[1] - gapSize - cornerSize])
        dArray.push([v[0] - gapSize - cornerSize, v[1] + 0 - gapSize])
      }
      //  |
      //  .--
      if ((v[0] == vArray[(index + 1 + vArray.length) % vArray.length][0] && v[1] > vArray[(index + 1 + vArray.length) % vArray.length][1]) &&
           (v[0] < vArray[(index - 1 + vArray.length) % vArray.length][0]) && v[1] == vArray[(index - 1 + vArray.length) % vArray.length][1]) {
        dArray.push([v[0] + cornerSize, v[1] + 0 - gapSize])
        dArray.push([v[0] + 0, v[1] - gapSize - cornerSize])
      }

      // internal
      // .__
      // |
      if ((v[0] == vArray[(index + 1 + vArray.length) % vArray.length][0] && v[1] < vArray[(index + 1 + vArray.length) % vArray.length][1]) &&
           (v[0] < vArray[(index - 1 + vArray.length) % vArray.length][0]) && v[1] == vArray[(index - 1 + vArray.length) % vArray.length][1]) {
        dArray.push([v[0] + cornerSize, v[1] + 0 - gapSize])
        dArray.push([v[0] + 0 - gapSize, v[1] + cornerSize])
      }
      //  __.
      //    |
      if ((v[0] > vArray[(index + 1 + vArray.length) % vArray.length][0] && v[1] == vArray[(index + 1 + vArray.length) % vArray.length][1]) &&
           (v[0] == vArray[(index - 1 + vArray.length) % vArray.length][0]) && v[1] < vArray[(index - 1 + vArray.length) % vArray.length][1]) {
        dArray.push([v[0] + 0, v[1] + cornerSize])
        dArray.push([v[0] - cornerSize - gapSize, v[1] + 0 - gapSize])
      }
      //    |
      //  --.
      if ((v[0] == vArray[(index + 1 + vArray.length) % vArray.length][0] && v[1] > vArray[(index + 1 + vArray.length) % vArray.length][1]) &&
           (v[0] > vArray[(index - 1 + vArray.length) % vArray.length][0]) && v[1] == vArray[(index - 1 + vArray.length) % vArray.length][1]) {
        dArray.push([v[0] - gapSize - cornerSize, v[1] + 0])
        dArray.push([v[0] + 0, v[1] - gapSize - cornerSize])
      }
      //  |
      //  .--
      if ((v[0] < vArray[(index + 1 + vArray.length) % vArray.length][0] && v[1] == vArray[(index + 1 + vArray.length) % vArray.length][1]) &&
           (v[0] == vArray[(index - 1 + vArray.length) % vArray.length][0]) && v[1] > vArray[(index - 1 + vArray.length) % vArray.length][1]) {
        dArray.push([v[0] + 0 - gapSize, v[1] - gapSize - cornerSize])
        dArray.push([v[0] + cornerSize, v[1] + 0])
      }
    })

    let path = 'M ' + dArray[0][0] + ' ' + dArray[0][1] + ' '
    dArray.forEach(v => {
        path += 'L ' + v[0] + ' ' + v[1] + ' '
    })

    // console.log(path)
    // console.log(vertex)
    // console.log(dArray)

    const page = state.app.selectedPage

    const el = state.app.selectedElements[0]
    // console.log(el)
    commit(types.updateElement, {
      egglement: el,
      name: el.id.split('.')[1],
      top: topMin,
      left: leftMin,
      height: (unit * colNumber) - gapSize,
      width: (unit * rowNumber) - gapSize,
      path: path,
      classes: {
        'matrix': matrix
      }
    })
    dispatch(types.registerElement, {pageId: page.id, el, global: el.global})
    return true
  },

  [types.separateElement]: async function ({ getters, commit, state, dispatch }, payload) {
    if (state.app.selectedElements.length < 1) {
      return false
    }
    const unit = state.app.gridUnit.origin / 10
    const cornerSize = state.app.cornerSize
    const gapSize = state.app.gapSize
    const elementCount = state.app.selectedElements.length
    const selectedElements = state.app.selectedElements

    let toSelect = []
    for (let elementIdx = 0; elementIdx < elementCount; elementIdx++) {
      const selectedElement = selectedElements[elementIdx]
      const matrix = selectedElement.classes.matrix

      const rowNumber = matrix.length
      const colNumber = matrix[0].length
      const topMax = selectedElement.top
      const leftMax = selectedElement.left

      if (rowNumber === 1 && colNumber === 1) {
        toSelect.push(selectedElement)
        continue
      }

      const page = state.app.selectedPage
      dispatch(types.removeElement, {page: page, elId: selectedElement.id})

      for (let i = 0; i < rowNumber; i++) {
        for (let j = 0; j < colNumber; j++) {
          if (matrix[i][j] === -1) {
            const height = unit - gapSize
            const width = unit - gapSize
            const top = topMax + unit * i
            const left = leftMax + unit * j

            let element = newElectrodeUnit('base', unit, cornerSize, gapSize, top, left)

            const fixedElement = fixElementToParentBounds({top, left, height, width}, page)
            element = {...element, ...fixedElement}
            element = await dispatch(types.registerElement, {pageId: page.id, el: element, global: global})
            // let parentId = payload.elId.substring(0, payload.elId.lastIndexOf('.'))
            // let parent = getChildNode(payload.page, parentId)
            // let eggIndex = parent.children.findIndex(egg => egg.id === payload.elId)
            // let element = parent.children[eggIndex]
            toSelect.push(element)
          }
        }
      }
    }
    commit(types._addSelectedElements, toSelect)
    return true
  },

/**
 * Refetches the elements on the page by the id's of the selectedElements,
 * cleans the selectedElements array and repopulates it with the fresh refetched elements.
 *
 * This is necessary for a correct data binding after redo/undo actions.
 */
  [types.rebaseSelectedElements]: function ({ getters, commit, state }) {
    let freshElements = state.app.selectedElements.map(el => getChildNode(state.app.selectedPage, el.id))
    commit(types._clearSelectedElements)
    freshElements.map(el => commit(types._addSelectedElement, el))
  }
}

export default elementActions
