<template>
  <mr-container
    :id="page.id"
    :zoom="zoom"
    :style="pageStyles"
    :class="[page.classes, {stage: true}]"
    :activeElements="selectedElements"
    :allElements="allElements"
    @arrows="arrowsHandler"
    @moving="movingHandler"
    @movestop="moveStopHandler"
    @resizestop="resizeStopHandler"
    @selectstop="selectStopHandler"
    @clearselection="clearSelectionHandler"
    @delete="deleteHandler"
    @copy="copyHandler"
    @cut="cutHandler"
    @paste="pasteHandler"
    @drop="dropHandler"
    @undo="$root.$emit('undo')"
    @redo="$root.$emit('redo')"
    @add="addElement($event)"
    @mousemove="mouseMoveElements($event)"
  >

    <stage-el
      v-for="element in page.children"
      :key="element.id"
      :elem="element">
    </stage-el>

  </mr-container>
</template>


<script>
import cloneDeep from 'clone-deep'
import elementsFromPoint from '@/polyfills/elementsFromPoint'
import { getComputedProp, fixElementToParentBounds } from '@/helpers/positionDimension'

import { mapState, mapActions, mapMutations } from 'vuex'
import { _clearSelectedElements, _addSelectedElements, registerElement,
        removeElement, resizeElement, moveElement, rebaseSelectedElements, margeSelectedElements } from '@/store/types'

import MrContainer from '@/components/editor/common/mr-vue/MrContainer'
import StageEl from './StageEl'

const DROP_BORDER = {
  width: '2px',
  style: 'solid',
  color: '#f1867f'
}

export default {
  name: 'stage',
  components: { StageEl, MrContainer },
  props: ['page', 'zoom'],
  created: function () {
    // this.$root.$on('paint-electrodes', this.paintElectrodes)
    this.$root.$on('combine-electrodes', this.combineElectrodes)
  },

  beforeDestroy: function () {
    this.$root.$off('combine-electrodes', this.combineElectrodes)
  },

  data: function () {
    return {
      clipboard: [],
      dropContainer: null,
      currentRelPosPaint: {x: 0, y: 0},
      defaultBorder: {
        width: '',
        style: '',
        color: ''
      }
    }
  },
  computed: {
    pageStyles () {
      return {
        ...this.page.styles,
        height: (typeof this.page.height === 'string') ? this.page.height : (this.page.height + 'px'),
        width: (typeof this.page.width === 'string') ? this.page.width : (this.page.width + 'px'),
        transform: 'scale(' + this.zoom + ')'
      }
    },

    ...mapState({
      selectedElements: state => state.app.selectedElements || [],
      allElements: state => state.app.selectedPage.children,
      projectComponents: state => state.project.components
    })
  },
  methods: {
    checkCollision (selectedEls, allEls) {
      const unit = 21
      const acElPos = []
      const alElPos = []
      selectedEls.forEach(acEl => {
        const acElX = parseInt(acEl.left / unit)
        const acElY = parseInt(acEl.top / unit)
        if (acEl.classes.matrix != null && acEl.classes.matrix.length > 0) {
          acEl.classes.matrix.forEach((acRow, acI) => {
            acRow.forEach((acItem, acJ) => {
              acElPos.push([acElX + acJ, acElY + acI])
            })
          })
        }
      })
      allEls.forEach(alEl => {
        let isSelected = false
        selectedEls.forEach(acEl => {
          if (alEl.id === acEl.id) {
            isSelected = true
          }
        })
        if (!isSelected) {
          const alElX = parseInt(alEl.left / unit)
          const alElY = parseInt(alEl.top / unit)
          if (alEl.classes.matrix != null && alEl.classes.matrix.length > 0) {
            alEl.classes.matrix.forEach((alRow, alI) => {
              alRow.forEach((alItem, alJ) => {
                alElPos.push([alElX + alJ, alElY + alI])
              })
            })
          }
        }
      })
      // console.log(acElPos, alElPos)
      let collision = false
      acElPos.forEach(acPos => {
        alElPos.forEach(alPos => {
          if (acPos.toString() === alPos.toString()) {
            collision = true
          }
        })
      })
      return collision
    },

    mouseMoveElements (e) {
      const unit = 21
      const offset = e.offsetEl
      const unitX = e.unitX
      const unitY = e.unitY
      const lastPos = e.lastElPos
      this.selectedElements.forEach((acEl, index) => {
        const top = unit * (unitY - offset[index][1])
        const left = unit * (unitX - offset[index][0])
        this.moveElement({ elId: acEl.id, pageId: this.page.id, top: top, left: left })
      })
      if (this.checkCollision(this.selectedElements, this.allElements)) {
        this.selectedElements.forEach((acEl, index) => {
          this.moveElement({ elId: acEl.id, pageId: this.page.id, top: lastPos[index][1], left: lastPos[index][0] })
        })
      }
    },

    addElement (e) {
      // console.log(e.x, e.y)
      // console.log(this.allElements)
      const posX = e.x
      const posY = e.y

      if (Math.floor((posX / this.zoom) / 21) === Math.floor((this.currentRelPosPaint.x / this.zoom) / 21) && Math.floor((posX / this.zoom) / 21) === Math.floor((this.currentRelPosPaint.y / this.zoom) / 21)) {
        return false
      }

      let canAdd = true
      this.allElements.forEach(el => {
        if (el.classes.matrix != null && el.classes.matrix.length > 0) {
          el.classes.matrix.forEach((row, i) => {
            row.forEach((item, j) => {
              if (el.classes.matrix[i][j] !== 0) {
                if ((posX / this.zoom) >= (el.left + (j * 21)) && (posX / this.zoom) <= (el.left + (j * 21) + 21) && (posY / this.zoom) >= (el.top + (i * 21)) && (posY / this.zoom) <= (el.top + (i * 21) + 21)) {
                  canAdd = false
                }
              }
            })
          })
        }
      })

      if (canAdd) {
        const _matrix = [
          [1]
        ]
        const base = {
            'name': 'base',
            'type': 'svg',
            'egglement': true,
            'wrappegg': true,
            'width': 198.5,
            'height': 198.5,
            'attrs': {},
            'styles': {
            },
            'classes': {
              'matrix': _matrix
            },
            'children': [
                {
                    'name': 'path',
                    'type': 'path',
                    'attrs': {
                      // 'd': 'M1 2 L2 1 L3 0 L5 2 L7 0 L9 2 L11 0 L13 2 L15 0 L17 2 L 19 0 L20 1 L21 2 L22 3 L20 5 L22 7 L20 9 L22 11 L20 13 L22 15 L20 17 L22 19 L21 20 L20 21 L19 20 L17 22 L15 20 L13 22 L11 20 L9 22 L7 20 L5 22 L3 20 L2 21 L1 20 L2 19 L0 17 L2 15 L0 13 L2 11 L0 9 L2 7 L0 5 L2 3 Z'
                      // 'd': 'M 0 1 L 0 19 L 1 20 L 19 20 L 20 19 L 20 1 L 19 0 L 1 0 Z'
                      'd': 'M0 1.5 L1.5 0 L197 0 L197 1.5 L198.5 197 L197 198.5 L1.5 198.5 L0 197 Z'
                    }
                }
            ]
        }

        let element = base
        // console.log(element)

        let height = getComputedProp('height', element, this.page)
        let width = getComputedProp('width', element, this.page)
        const unit = 200
        const unitX = parseInt((e.x / this.zoom) / unit)
        const unitY = parseInt((e.y / this.zoom) / unit)
        let top = unit * unitY
        let left = unit * unitX

        // Correct drop positions based on the editorZoom
        // top = Math.round(top / this.zoom)
        // left = Math.round(left / this.zoom)

        const fixedElement = fixElementToParentBounds({top, left, height, width}, this.page)
        element = {...element, ...fixedElement}

        this.registerElement({pageId: this.page.id, el: element, global: e.shiftKey})
        this.currentRelPosPaint.x = posX
        this.currentRelPosPaint.y = posY
      }
    },

    async combineElectrodes () {
      const combineSuccess = await this.margeSelectedElements()
      if (combineSuccess) {
        this.deleteHandler()
      } else {
        this.$toasted.show(
          'Electrode combining failed',
          {
            position: 'bottom-right',
            duration: 3000
          },
        )
      }
    },

    clearSelectionHandler () {
      if (this.selectedElements.length > 0) this._clearSelectedElements()
    },

    deleteHandler () {
      if (this.selectedElements.length > 0) {
        this.selectedElements.map(el => this.removeElement({page: this.page, elId: el.id}))
      }
    },

    copyHandler () {
      if (this.selectedElements.length > 0) {
        this.clipboard = []
        this.selectedElements.map(el => this.clipboard.push(cloneDeep(el)))
      }
    },

    cutHandler () {
      if (this.selectedElements.length > 0) {
        this.clipboard = []
        this.selectedElements.map(el => {
          this.clipboard.push(cloneDeep(el))
          this.removeElement({page: this.page, elId: el.id})
        })
      }
    },

    pasteHandler () {
      if (this.clipboard.length > 0) {
        this.clipboard.map(el => {
          this.registerElement({pageId: this.page.id, el, global: el.global})
        })
      }
    },

    dropHandler (e) {
      console.log(this.allElements)
      const mainContainer = document.getElementById('main')
      let element = JSON.parse(e.dataTransfer.getData('text/plain'))
      console.log(element)

      let height = getComputedProp('height', element, this.page)
      let width = getComputedProp('width', element, this.page)
      const unit = 21
      const posY = (e.pageY + mainContainer.scrollTop - mainContainer.offsetTop - this.$el.offsetTop - (height / 2))
      const posX = (e.pageX + mainContainer.scrollLeft - mainContainer.offsetLeft - this.$el.offsetLeft - (width / 2))

      let canAdd = true
      this.allElements.forEach(el => {
        if (el.matrix != null && el.matrix.length > 0) {
          el.matrix.forEach((row, i) => {
            row.forEach((item, j) => {
              if (el.matrix[i][j] !== 0) {
                if ((posX / this.zoom) >= (el.left + (j * 21)) && (posX / this.zoom) <= (el.left + (j * 21) + 21) && (posY / this.zoom) >= (el.top + (i * 21)) && (posY / this.zoom) <= (el.top + (i * 21) + 21)) {
                  canAdd = false
                }
              }
            })
          })
        }
      })

      if (!canAdd) {
        this.$toasted.show(
          'Electrode placement failed',
          {
            position: 'bottom-right',
            duration: 3000
          },
        )
        return false
      }

      const unitY = parseInt(posY / this.zoom / unit)
      const unitX = parseInt(posX / this.zoom / unit)
      let top = unitY * unit
      let left = unitX * unit

      // Correct drop positions based on the editorZoom
      // top = Math.round(top / this.zoom)
      // left = Math.round(left / this.zoom)

      const fixedElement = fixElementToParentBounds({top, left, height, width}, this.page)
      element = {...element, ...fixedElement}

      this.registerElement({pageId: this.page.id, el: element, global: e.shiftKey})
    },

    selectStopHandler (selectionBox) {
      if ((selectionBox.top === selectionBox.bottom && selectionBox.left === selectionBox.right) ||
          (this.page.children.length === 0)) return

      let selectedElements = []
      this.page.children.forEach(childEl => {
        const child = (childEl.global) ? {...childEl, ...this.getComponentRef(childEl), id: childEl.id} : childEl

        let childTop = getComputedProp('top', child)
        let childLeft = getComputedProp('left', child)
        let childBottom = getComputedProp('height', child, this.page) + childTop
        let childRight = getComputedProp('width', child, this.page) + childLeft

        if (((childTop <= selectionBox.bottom) && (childLeft <= selectionBox.right) &&
            (childBottom >= selectionBox.top) && (childRight >= selectionBox.left)) ||
            ((childTop <= selectionBox.bottom) && (childRight >= selectionBox.left) &&
            (childBottom >= selectionBox.top) && (childLeft <= selectionBox.right))) {
          selectedElements.push(child)
        }
      })

      if (selectedElements.length > 0) {
        this._addSelectedElements(selectedElements)
      }
    },

    getComponentRef (component) {
      return this.projectComponents[this.projectComponents.findIndex(comp => comp.name === component.name)]
    },

    resizeStopHandler (resStopData) {
      resStopData.map(resElData => this.resizeElement({...resElData, pageId: this.page.id}))
      this.rebaseSelectedElements()
    },

    arrowsHandler ({direction, shiftKey}) {
      if (this.selectedElements.length > 0) {
        let diff = shiftKey ? 10 : 1

        let addedTop = 0
        let addedBottom = 0
        let addedLeft = 0
        let addedRight = 0

        switch (direction) {
          case 'up': addedTop -= diff; addedBottom += diff; addedLeft = addedRight = null; break
          case 'down': addedBottom -= diff; addedTop += diff; addedLeft = addedRight = null; break
          case 'left': addedLeft -= diff; addedRight += diff; addedTop = addedBottom = null; break
          case 'right': addedRight -= diff; addedLeft += diff; addedTop = addedBottom = null; break
        }

        this.selectedElements.map(el => {
          let compTop = getComputedProp('top', el)
          let compBottom = getComputedProp('bottom', el)
          let compLeft = getComputedProp('left', el)
          let compRight = getComputedProp('right', el)

          let top = (addedTop && ((compTop + addedTop) >= 0) && ((compBottom + addedBottom) >= 0))
            ? (compTop + addedTop) : null
          let bottom = (addedBottom && ((compBottom + addedBottom) >= 0) && ((compTop + addedTop) >= 0))
            ? (compBottom + addedBottom) : null
          let left = (addedLeft && ((compLeft + addedLeft) >= 0) && ((compRight + addedRight) >= 0))
            ? (compLeft + addedLeft) : null
          let right = (addedRight && ((compRight + addedRight) >= 0) && ((compLeft + addedLeft) >= 0))
            ? (compRight + addedRight) : null

          if (top || bottom || left || right) {
            this.moveElement({ elId: el.id, pageId: this.page.id, top, bottom, left, right })
          }
        })
        this.rebaseSelectedElements()
      }
    },

    movingHandler (absMouseX, absMouseY) {
      this.dropContainer = this.getContaineggOnPoint(absMouseX, absMouseY)
      this.toggleDroppableCursor(!!this.dropContainer)
    },

    moveStopHandler (moveStopData) {
      const containegg = this.getContaineggOnPoint(moveStopData.absMouseX, moveStopData.absMouseY)
      const parentId = containegg ? containegg.id : null

      moveStopData.moveElData.map(moveData => this.moveElement({
        ...moveData,
        pageId: this.page.id,
        parentId,
        mouseX: moveStopData.relMouseX,
        mouseY: moveStopData.relMouseY
      }))

      this.rebaseSelectedElements()
      this.toggleDroppableCursor(false)
      this.dropContainer = null
    },

    getContaineggOnPoint (x, y) {
      const movingEggs = this.selectedElements
      const parentsIds = movingEggs.map(egg => egg.id.substring(0, egg.id.lastIndexOf('.')))
      const commonParentId = parentsIds.every((val, i, arr) => val === arr[0]) ? parentsIds[0] : null
      const elementsOnPoint = elementsFromPoint(x, y)

      for (let el of elementsOnPoint) {
        if (el.id === commonParentId) return null
        if ((el.dataset.mrContainer) ||
          (
            (el.dataset.containegg) &&
            (!el.dataset.componegg) &&
            (movingEggs.every(egg => !el.id.includes(egg.id)))
          )
        ) return el
      }
      return null
    },

    toggleDroppableCursor (isDroppable) {
      isDroppable
        ? document.documentElement.classList.add('droppable')
        : document.documentElement.classList.remove('droppable')
    },

    ...mapActions([rebaseSelectedElements, registerElement, removeElement, resizeElement, moveElement, margeSelectedElements]),
    ...mapMutations([_clearSelectedElements, _addSelectedElements])
  },
  watch: {
    dropContainer: function (newVal, oldVal) {
      if (oldVal) {
        oldVal.style.borderWidth = this.defaultBorder.width
        oldVal.style.borderStyle = this.defaultBorder.style
        oldVal.style.borderColor = this.defaultBorder.color
      }

      if (newVal) {
        this.defaultBorder.width = newVal.style.borderWidth
        this.defaultBorder.style = newVal.style.borderStyle
        this.defaultBorder.color = newVal.style.borderColor
        newVal.style.borderWidth = DROP_BORDER.width
        newVal.style.borderStyle = DROP_BORDER.style
        newVal.style.borderColor = DROP_BORDER.color
      }
    }
  }
}
</script>


<style>
html.droppable,
html.droppable * {
  cursor: copy !important;
}
</style>

<style scoped>
.stage {
  transform-origin: 0 0;
  user-select: none;
  margin: 0 auto 0 !important;
  border: 2px solid rgba(0, 0, 0, 0);
  /* for paper style */
  box-shadow:
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);
}
</style>
