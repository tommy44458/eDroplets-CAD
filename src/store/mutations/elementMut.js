import types from '@/store/types'

const commonElementMutations = {
/**
 * Adds the passed egglement to the parent.children array
 *
 * @param {object} payload.parent : Parent of the new egglement
 * @param {object} payload.egglement : New egglement to save
 */
  [types.createEgglement]: function (state, payload) {
    payload.parent.children.push(payload.egglement)
  },

/**
 * Updates the passed egglement with the defined new values
 *
 * @param {object} payload.egglement : Egglement to update
 * @param {number|null} [payload.left] : New egglement's left position
 * @param {number|null} [payload.top] : New egglement's top position
 * @param {number|string|null} [payload.zIndex] : New egglement's zIndex order
 * @param {number|string|null} [payload.height] : New egglement's height
 * @param {number|string|null} [payload.width] : New egglement's width
 * @param {string|null} [payload.text] : New egglement's text child
 * @param {object|null} [payload.classes] : New egglement's classes
 * @param {object|null} [payload.styles] : New egglement's styles
 * @param {object|null} [payload.attrs] : New egglement's attributes
 * @param {object|null} [payload.initialPos] : New egglement's initial position'
 */
  [types.updateElement]: function (state, payload) {
    if ((typeof payload.left !== 'undefined') && (payload.left !== null)) payload.egglement.left = payload.left
    if ((typeof payload.top !== 'undefined') && (payload.top !== null)) payload.egglement.top = payload.top
    if ((typeof payload.right !== 'undefined') && (payload.right !== null)) payload.egglement.right = payload.right
    if ((typeof payload.bottom !== 'undefined') && (payload.bottom !== null)) payload.egglement.bottom = payload.bottom
    if ((typeof payload.zIndex !== 'undefined') && (payload.zIndex !== null)) payload.egglement.zIndex = payload.zIndex
    if ((typeof payload.height !== 'undefined') && (payload.height !== null)) payload.egglement.height = payload.height
    if ((typeof payload.width !== 'undefined') && (payload.width !== null)) payload.egglement.width = payload.width
    if ((typeof payload.text !== 'undefined') && (payload.text !== null)) payload.egglement.text = payload.text
    if ((typeof payload.name !== 'undefined') && (payload.name !== null)) payload.egglement.name = payload.name
    if (payload.classes) payload.egglement.classes = payload.classes
    if (payload.styles) payload.egglement.styles = payload.styles
    if (payload.attrs) payload.egglement.attrs = payload.attrs
    if (payload.initialPos) payload.egglement.initialPos = payload.initialPos
    if (payload.path !== 'undefined' && payload.egglement.children.length > 0) {
      if (payload.path) payload.egglement.children[0].attrs.d = payload.path
    }
  },

/**
 * Removes the egglement under the specified index
 * from the passed parent egglement (or page)
 *
 * @param {object} payload.parent : Parent container (egglement or page)
 * @param {number} payload.eggIndex : Egglement's index
 */
  [types.deleteEgglement]: function (state, payload) {
    payload.parent.children.splice(payload.eggIndex, 1)
  }
}

/*******************************************************************
 * In VUEGG, internal mutations (starting with "_"),
 * won't be taken into consideration for the Undo/Redo functionality.
 * This is a convenience behaviour for certain vuegg workarounds.
 *******************************************************************/
const internalElementMutations = {
/**
 * Resets the selectedElements aray
 */
  [types._clearSelectedElements]: function (state) {
    state.app.selectedElements = []
  },

/**
 * Replaces the selectedElements array with a new array
 *
 * @param {array} elements : selected element
 */
  [types._addSelectedElements]: function (state, elements) {
    state.app.selectedElements = elements
  },

/**
 * Adds a new element to the selectedElements array
 *
 * @param {object} elem : selected element
 */
  [types._addSelectedElement]: function (state, elem) {
    state.app.selectedElements.push(elem)
  },

/**
 * Removes an element from the selectedElements array
 *
 * @param {object} elemIndex : Index of the element to remove
 */
  [types._removeSelectedElement]: function (state, elemIndex) {
    state.app.selectedElements.splice(elemIndex, 1)
  },

  [types.sortSelectedElement]: function (state) {
    state.app.selectedElements.sort(function (a, b) {
      if (a.top > b.top) {
        return 1
      } else if (a.top === b.top) {
        if (a.left > b.left) {
          return 1
        } else {
          return -1
        }
      } else {
        return -1
      }
    })
  },

/**
 * Set new gridUnit
 */
 [types._updateGridUnit]: function (state, val) {
  state.app.gridUnit.current = val
  },

/**
 * Update chip matrix
 *
 * @param {object} payload.egglement : Egglement to update
 * @param {boolean} payload.add : If true, add the element to the matrix. Otherwise, remove it
 */
  [types._updateChipMatrix]: function (state, payload) {
    for (let i = 0; i < payload.egglement.classes.matrix.length; i++) {
      for (let j = 0; j < payload.egglement.classes.matrix[i].length; j++) {
        if (payload.egglement.classes.matrix[i][j] !== 0) {
          if (payload.add) {
            state.app.chip.matrix[Math.ceil(payload.egglement.top * 10 / state.app.gridUnit.origin) + i][Math.ceil(payload.egglement.left * 10 / state.app.gridUnit.origin) + j] = 1
          } else {
            state.app.chip.matrix[Math.ceil(payload.egglement.top * 10 / state.app.gridUnit.origin) + i][Math.ceil(payload.egglement.left * 10 / state.app.gridUnit.origin) + j] = 0
          }
        }
      }
    }
  }
}

const elementMutations = {
  ...commonElementMutations,
  ...internalElementMutations
}

export default elementMutations
