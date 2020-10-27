/* eslint-disable eqeqeq */
import types from '@/store/types'
import componentFactory from '@/factories/componentFactory'
import { setElId, getChildNode, calcRelativePoint } from '@/helpers/recursiveMethods'
import { fixElementToParentBounds, getComputedProp } from '@/helpers/positionDimension'

// const mergeElementsGroups = []

// const refreshMergeElements = function (state, commit) {
//   mergeElementsGroups.forEach(group => {
//     group.forEach(el => {
//       commit(types.updateEgglement, {
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
//         commit(types.updateEgglement, {
//           egglement: el,
//           height: 20
//         })
//       }
//       if (lMax) {
//         commit(types.updateEgglement, {
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
  [types.registerElement]: function ({ getters, commit }, payload) {
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
 * @see {@link [types.updateEgglement]}
 */
  [types.resizeElement]: function ({ getters, commit }, payload) {
    let page = getters.getPageById(payload.pageId)
    let egglement = getChildNode(page, payload.elId)

    if (
        payload.left !== egglement.left || payload.top !== egglement.top ||
        payload.right !== egglement.right || payload.bottom !== egglement.bottom ||
        payload.height !== egglement.height || payload.width !== egglement.width
      ) {
      commit(types.updateEgglement, {
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
 * @see {@link [types.updateEgglement]}
 */
  [types.moveElement]: function ({ getters, dispatch, commit }, payload) {
    let page = getters.getPageById(payload.pageId)
    let egglement = getChildNode(page, payload.elId)

    if (payload.parentId) {
      dispatch(types.changeElementParent, {...payload, page, egglement})
    } else if (payload.left !== egglement.left || payload.top !== egglement.top) {
      commit(types.updateEgglement, {
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
 * @see {@link [types.updateEgglement]}
 */
  [types.changeElementParent]: function ({ getters, commit }, payload) {
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
    commit(types.updateEgglement, {
      ...fixedProps,
      egglement: payload.egglement,
      bottom: 'auto',
      right: 'auto'
    })
  },

  [types.margeSelectedElements]: function ({ getters, commit, state }) {
    commit(types.sortSelectedElement)

    // const newSelectedElements = []
    // state.app.selectedElements.forEach(el => {
    //   let haveNeighbor = false
    //   state.app.selectedElements.forEach(el2 => {
    //     if (el2.id != el.id) {
    //       if (Math.abs(el2.top - el.top) <= 21 && Math.abs(el2.left - el.left) <= 21) {
    //         haveNeighbor = true
    //       }
    //     }
    //   })
    //   if (haveNeighbor) {
    //     newSelectedElements.push(el)
    //   }
    // })

    // console.log(newSelectedElements)

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

    const rowNumber = ((leftMax - leftMin) / 21) + 1
    const colNumber = ((topMax - topMin) / 21) + 1

    const matrix = []

    for (let i = 0; i < colNumber; i++) {
      const row = []
      for (let j = 0; j < rowNumber; j++) {
        row.push(0)
      }
      matrix.push(row)
    }

    state.app.selectedElements.forEach(el => {
      const rowIndex = (el.left - leftMin) / 21
      const colIndex = (el.top - topMin) / 21
      matrix[colIndex][rowIndex] = 1
    })

    console.log(matrix)

    // matrix.forEach((row, i) => {
    //   if (row.every(function (value) { return (value == 0) ? 1 : 0 })) {
    //     console.log('row', row)
    //   }
    //   if (i == 0) {
    //     row.forEach((item, j) => {
    //       const col = []
    //       const trl = []
    //       const trr = []
    //       let num = 0
    //       while (matrix[i + num] != null) {
    //         col.push(matrix[i + num][j])
    //         num++
    //       }
    //       num = 0
    //       while (matrix[i + num] != null && matrix[i + num][j - num] != null) {
    //         trl.push(matrix[i + num][j - num])
    //         num++
    //       }
    //       num = 0
    //       while (matrix[i + num] != null && matrix[i + num][j + num] != null) {
    //         trr.push(matrix[i + num][j + num])
    //         num++
    //       }
    //       console.log('col', col)
    //       console.log('trl', trl)
    //       console.log('trr', trr)
    //     })
    //   }
    // })

    // let path = ''
    // let iNow = 0
    // let jNow = 0

    // let way = 0 // 0: top, 1: right, 2: down, 3: left 上右下左遍歷 上卡住畫水平向右線 右卡住畫向下線
    // while (1) {
    //   if (matrix[iNow][jNow] != 0) {
    //     if (path.length == 0) {
    //       path = 'M' + ((jNow * 20)) + ' ' + ((iNow * 20) + 1) + ' '
    //     }
    //     switch (way) {
    //       case 0:
    //         if (iNow > 0 && matrix[iNow - 1] != null && matrix[iNow - 1][jNow] == 1) {
    //           path = path + 'L' + ((jNow * 20)) + ' ' + ((iNow * 20) - 20) + ' '
    //           jNow++
    //         } else {
    //           path = path + 'L' + ((jNow * 20) + 1) + ' ' + (iNow * 20) + ' '
    //         }
    //         break
    //     }
    //   } else {
    //     if (path.length > 0) {
    //       way++
    //     }
    //   }
    // }

    // let topNow = -1
    // let leftNow = -1

    // state.app.selectedElements.forEach(el => {
    //   if (topNow < 0) {
    //     topNow = el.top
    //   }

    //   const row = []

    //   if (el.top) {

    //   }

    // })

    // state.app.selectedElements.map(el => {
    //   commit(types.updateEgglement, {
    //     egglement: el,
    //     height: 20,
    //     width: 20
    //   })
    // })
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
