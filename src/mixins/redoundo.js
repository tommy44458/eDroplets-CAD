import cloneDeep from 'clone-deep'
import { isEqual } from 'lodash'
import types from '@/store/types'

const MAX_HISTORY = 250
const DEBOUNCE_DELAY = 300
const IGNORED_MUTATIONS = Object.values(types).filter(type => type.startsWith('_'))

const debounce = (func, wait) => {
  let timeout

  return function () {
    const context = this
    const args = arguments

    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(context, args), wait)
  }
}
/**
 * Vue Mixin to control the State history and undo/redo functionality
 *
 * @type {Vue.mixin}
 * @see {@link https://vuejs.org/v2/guide/mixins.html|Vue Mixins}
 */
const redoundo = {
  data: function () {
    return {
      done: [],
      undone: []
    }
  },

  created: function () {
    this.saveState = debounce(this.saveState, DEBOUNCE_DELAY)

    this.$store.subscribe((mutation, state) => {
      // Ignore mutations that should not be saved
      if (IGNORED_MUTATIONS.includes(mutation.type)) {
        return
      }

      // Save the state with debounce
      this.saveState(state)
    })

    this.$root.$on('undo', this.undo)
    this.$root.$on('redo', this.redo)
  },

  beforeDestroy: function () {
    this.$root.$off('undo', this.undo)
    this.$root.$off('redo', this.redo)
  },

  computed: {
    canUndo () {
    // There should always be at least one state (initializeState)
      return this.done.length > 1
    },
    canRedo () {
      return this.undone.length > 0
    }
  },

  methods: {
    saveState(state) {
      // If the history size is reached, the eldest state will be removed
      if (this.done.length === MAX_HISTORY) this.done.shift()

      // Check if the new state is different from the previous state
      const previousState = this.done[this.done.length - 1]
      if (!isEqual(state, previousState)) {
        this.done.push(cloneDeep(state))
        this.undone = []

        // To display if changes had happened to the project
        this.updateCanRedoUndo()
        this.$store.dispatch(types.checkLastSaved)
      }
    },

    undo () {
      if (this.canUndo) {
        this.undone.push(this.done.pop())
        let undoState = this.done[this.done.length - 1]
        this.$store.replaceState(cloneDeep(undoState))
        this.$root.$emit('rebaseState')
        this.updateCanRedoUndo()
      }
    },

    redo () {
      if (this.canRedo) {
        let redoState = this.undone.pop()
        this.done.push(redoState)
        this.$store.replaceState(cloneDeep(redoState))
        this.$root.$emit('rebaseState')
        this.updateCanRedoUndo()
      }
    },

    updateCanRedoUndo () {
      this.$store.commit(types._toggleCanUndo, this.canUndo)
      this.$store.commit(types._toggleCanRedo, this.canRedo)
    }
  }
}

export default redoundo
