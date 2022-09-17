import appMutations from './appMut'
import authMutations from './authMut'
import projectMutations from './projectMut'
import pageMutations from './pageMut'
import elementMutations from './elementMut'
import componentMutations from './componentMut'
import { updateField } from 'vuex-map-fields'

/**
 * Vuex Store Mutations
 *
 * @constant
 * @type {object}
 * @see {@link https://vuex.vuejs.org/en/mutations.html|Vuex Mutations}
 */
const mutations = {
  /**
   * Saves the initial state for the redo/undo functionality
   */
  updateField,
  initializeState: function (state) {
    console.debug('Base state saved')
  },
  ...appMutations,
  ...authMutations,
  ...projectMutations,
  ...pageMutations,
  ...elementMutations,
  ...componentMutations
}

export default mutations
