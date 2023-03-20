<template>
  <mr-container
    :id="page.id"
    :zoom="zoom" 
    :style="pageStyles"
    :class="[page.classes, {stage: true}]"
    :activeElements="selectedElements"
    :allElements="allElements"
    @rightClick="rightClickHandler"
    @arrows="arrowsHandler"
    @moving="movingHandler"
    @movestop="moveStopHandler"
    @resizestop="resizeStopHandler"
    @selectstop="selectStopHandler"
    @clearselection="clearSelectionHandler"
    @delete="deleteHandler"
    @copy="copyHandler"
    @cut="cutHandler"
    @paste="pasteHandler($event)"
    @drop="dropHandler"
    @undo="$root.$emit('undo')"
    @redo="$root.$emit('redo')"
    @add="addElement($event)"
    @setStageLastPos="setChipLastPos()"
    @moveStage="moveChip($event)"
    @mousemove="mouseMoveElements($event)"
  >

    <stage-el
      v-for="element in page.children"
      :key="element.id"
      :elem="element">
    </stage-el>

    <div v-if="openContextMenu" :key="keyContextMenu">
      <context-menu
        :axis="rightClickPoint"
        :zoom="zoom" 
        :specialState="paint || moveStage"
        :clipboardLength="clipboard.length"
        :selectedElementsLength="selectedElements.length"
        @clearState="clearState"
        @draw="drawState"
        @delete="deleteHandler"
        @copy="copyHandler"
        @cut="cutHandler"
        @paste="pasteHandler(rightClickPoint)"
        @combine="combineElectrodes"
        @separate="separateElementHandler"
      ></context-menu>
    </div>
  </mr-container>
</template>


<script>
// import { dxfToSvg } from '@/store/actions/dxf.js'
import simple from 'raw-loader!@/assets/dxf/simple.txt'
import empty from 'raw-loader!@/assets/dxf/empty.txt'
import electrode from 'raw-loader!@/assets/dxf/only_one_electrode.txt'
import wire from 'raw-loader!@/assets/dxf/only_wire.txt'
import cloneDeep from 'clone-deep'
import elementsFromPoint from '@/polyfills/elementsFromPoint'
import { getComputedProp, fixElementToParentBounds } from '@/helpers/positionDimension'

import { mapState, mapActions, mapMutations } from 'vuex'
import { _clearSelectedElements, _addSelectedElement, registerElement,
        removeElement, resizeElement, moveElement, rebaseSelectedElements, margeSelectedElements, separateElement, updateElement, _updateChipMatrix } from '@/store/types'

import MrContainer from '@/components/editor/common/mr-vue/MrContainer'
import StageEl from './StageEl'
import { mapFields } from 'vuex-map-fields'
import newElectrodeUnit from '@/factories/electrodeUnitFactory'
import ContextMenu from '../common/ContextMenu/index.vue'

const DROP_BORDER = {
  width: '2px',
  style: 'solid',
  color: '#f1867f'
}

export default {
  name: 'stage',
  components: { StageEl, MrContainer, ContextMenu },
  props: ['page', 'zoom'],
  created: function () {
    this.$root.$on('combine-electrodes', this.combineElectrodes)
  },

  beforeDestroy: function () {
    this.$root.$off('combine-electrodes', this.combineElectrodes)
  },

  data: function () {
    return {
      keyContextMenu: 0,
      rightClickPoint: {x: 0, y: 0},
      clipboard: [],
      dropContainer: null,
      currentRelPosPoint: {x: 0, y: 0},
      defaultBorder: {
        width: '',
        style: '',
        color: ''
      },
      chipLastPos: {
        top: 0,
        left: 0
      },
      simple: simple,
      empty: empty,
      electrode: electrode,
      wire: wire
    }
  },
  computed: {
    ...mapFields([
      'app.openContextMenu',
      'app.squareSize',
      'app.gridUnit',
      'app.cornerSize',
      'app.gapSize',
      'app.stagePosTop',
      'app.stagePosLeft',
      'app.editorZoom',
      'app.edit.moveStage',
      'app.edit.paint',
      'app.chip'
    ]),

    pageStyles () {
      const gridLineWidth = 1 / this.zoom
      return {
        ...this.page.styles,
        height: (typeof this.page.height === 'string') ? this.page.height : (this.page.height + 'px'),
        width: (typeof this.page.width === 'string') ? this.page.width : (this.page.width + 'px'),
        transform: 'scale(' + this.zoom + ')',
        'background-image': 'linear-gradient(rgba(0,0,0,.1) ' + gridLineWidth + 'px, transparent 0),' +
        'linear-gradient(90deg, rgba(0,0,0,.1) ' + gridLineWidth + 'px, transparent 0),' +
        'linear-gradient(rgba(0,0,0,.15) ' + gridLineWidth + 'px, transparent 0),' +
        'linear-gradient(90deg, rgba(0,0,0,.15) ' + gridLineWidth + 'px, transparent 0)'
      }
    },

    ...mapState({
      selectedElements: state => state.app.selectedElements || [],
      allElements: state => state.app.selectedPage.children,
      projectComponents: state => state.project.components
    })
  },
  methods: {
    rightClickHandler (mousePoint) {
      this.rightClickPoint = mousePoint
      this.openContextMenu = true
      this.keyContextMenu++
    },

    clearState () {
      this.paint = false
      this.moveStage = false
    },

    drawState () {
      this.paint = true
      this.moveStage = false
    },

    checkCollision (selectedEls) {
      if (selectedEls.length > 0) {
        const unit = this.gridUnit.current / 10
        let collision = false
        selectedEls.forEach(acEl => {
          for (let i = 0; i < acEl.classes.matrix.length; i++) {
            for (let j = 0; j < acEl.classes.matrix[i].length; j++) {
              if (acEl.classes.matrix[i][j] !== 0) {
                const y = acEl.top / unit + i
                const x = acEl.left / unit + j
                if (y < 0 || x < 0 || y > this.chip.matrix.length || x > this.chip.matrix[0].length || this.chip.matrix[y][x]) {
                  collision = true
                }
              }
            }
          }
        })
        return collision
      }
    },

    mouseMoveElements (e) {
      const unit = this.gridUnit.current / 10
      const offset = e.offsetEl
      const unitX = e.unitX
      const unitY = e.unitY
      const offsetX = parseInt(this.selectedElements[0].initialPos.left / unit) - parseInt((e.initMousePosX / this.zoom) / unit)
      const offsetY = parseInt(this.selectedElements[0].initialPos.top / unit) - parseInt((e.initMousePosY / this.zoom) / unit)

      this.selectedElements.forEach((acEl, index) => {
        let top = unit * (unitY - offset[index][1] + offsetY)
        let left = unit * (unitX - offset[index][0] + offsetX)
        this.moveElement({ elId: acEl.id, pageId: this.page.id, top: top, left: left })
      })
    },

    setChipLastPos () {
      this.chipLastPos.top = this.stagePosTop
      this.chipLastPos.left = this.stagePosLeft
    },

    moveChip (e) {
      const _x = e[1].x - e[0].x
      const _y = e[1].y - e[0].y
      this.stagePosTop = this.chipLastPos.top + _y
      this.stagePosLeft = this.chipLastPos.left + _x
    },

    async addElement (e) {
      const unit = this.squareSize / 10
      const originUnit = this.gridUnit.origin / 10
      const cornerSize = this.cornerSize
      const gapSize = this.gapSize
      const posX = e.x
      const posY = e.y

      let canAdd = true

      const unitX = parseInt((posX / this.zoom) / originUnit)
      const unitY = parseInt((posY / this.zoom) / originUnit)
      const top = originUnit * unitY
      const left = originUnit * unitX

      const chipX = Math.floor((posX / this.zoom) / originUnit)
      const chipY = Math.floor((posY / this.zoom) / originUnit)

      for (let i = 0; i < unit / originUnit; i++) {
        for (let j = 0; j < unit / originUnit; j++) {
          if (this.chip.matrix[chipY + i][chipX + j] || this.chip.matrix[chipY + i][chipX + j] === undefined) {
            canAdd = false
          }
        }
      }

      if (canAdd) {
        const elementType = (unit !== originUnit) ? 'merged' : 'base'

        let element = newElectrodeUnit(elementType, unit, cornerSize, gapSize, top, left)

        const height = getComputedProp('height', element, this.page)
        const width = getComputedProp('width', element, this.page)

        const fixedElement = fixElementToParentBounds({top, left, height, width}, this.page)
        element = {...element, ...fixedElement}
        element = await this.registerElement({pageId: this.page.id, el: element, global: e.shiftKey})
        this.currentRelPosPoint.x = posX
        this.currentRelPosPoint.y = posY

        if (elementType !== 'base') {
          const matrix = []
          const rowNumber = (width + gapSize) / originUnit
          const colNumber = (height + gapSize) / originUnit
          for (let i = 0; i < rowNumber; i++) {
            const row = []
            for (let j = 0; j < colNumber; j++) {
              row.push(-1)
            }
            matrix.push(row)
          }
          this.updateElement({
            egglement: element,
            classes: {
              'matrix': matrix
            }
          })
        }

        this._updateChipMatrix({
          egglement: element,
          add: true
        })
      }
    },

    async combineElectrodes () {
      const combineSuccess = await this.margeSelectedElements()
      if (combineSuccess) {
        if (this.selectedElements.length > 0) {
          this.selectedElements.map(el => this.removeElement({page: this.page, elId: el.id}))
        }
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

    async separateElementHandler () {
      const separateSuccess = await this.separateElement()
      if (!separateSuccess) {
        this.$toasted.show(
          'Electrode separating failed',
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
        this.selectedElements.map(el => {
          this._updateChipMatrix({
            egglement: el,
            add: false
          })
          this.removeElement({page: this.page, elId: el.id})
        })
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

    async pasteHandler (e) {
      if (this.clipboard.length > 0) {
        const unit = this.gridUnit.origin / 10
        const unitX = parseInt((e.x / this.zoom) / unit)
        const unitY = parseInt((e.y / this.zoom) / unit)
        const top = unit * unitY
        const left = unit * unitX
        const cornerSize = this.cornerSize
        const gapSize = this.gapSize
        const posX = e.x
        const posY = e.y

        let canAdd = true
        const pasteTop = this.clipboard[0].top
        const pasteLeft = this.clipboard[0].left
        this.clipboard.map(el => {
          const testEl = [{
            ...el,
            top: top + el.top - pasteTop,
            left: left + el.left - pasteLeft
          }]
          if (this.checkCollision(testEl)) canAdd = false
        })

        if (canAdd) {
          this.clipboard.map(async el => {
            el.top = top + el.top - pasteTop
            el.left = left + el.left - pasteLeft
            let element = newElectrodeUnit(el.name, unit, cornerSize, gapSize, el.top, el.left)
            const fixedElement = {
              top: el.top,
              left: el.left,
              height: el.height,
              width: el.width
            }
            element = {...element, ...fixedElement}
            element = await this.registerElement({pageId: this.page.id, el: element, global: el.global})
            this.currentRelPosPoint.x = posX
            this.currentRelPosPoint.y = posY
            if (element.name !== 'base') {
              this.updateElement({
                egglement: element,
                name: element.id.split('.')[1],
                path: el.children[0].attrs.d,
                classes: {
                  'matrix': el.classes.matrix
                }
              })
              this._updateChipMatrix({
                egglement: element,
                add: true
            })
            }
          })
        } else {
          this.$toasted.show(
            'Electrode pasting failed',
            {
              position: 'bottom-right',
              duration: 3000
            },
          )
        }
      }
    },

    dropHandler (e) {
      console.log(this.allElements)
      const mainContainer = document.getElementById('main')
      let element = JSON.parse(e.dataTransfer.getData('text/plain'))
      console.log(element)

      let height = getComputedProp('height', element, this.page)
      let width = getComputedProp('width', element, this.page)
      const unit = this.gridUnit.current / 10
      const posY = (e.pageY + mainContainer.scrollTop - mainContainer.offsetTop - this.$el.offsetTop - (height / 2))
      const posX = (e.pageX + mainContainer.scrollLeft - mainContainer.offsetLeft - this.$el.offsetLeft - (width / 2))

      let canAdd = true
      this.allElements.forEach(el => {
        if (el.matrix != null && el.matrix.length > 0) {
          el.matrix.forEach((row, i) => {
            row.forEach((item, j) => {
              if (el.matrix[i][j] !== 0) {
                if ((posX / this.zoom) >= (el.left + (j * unit)) && (posX / this.zoom) <= (el.left + (j * unit) + unit) && (posY / this.zoom) >= (el.top + (i * unit)) && (posY / this.zoom) <= (el.top + (i * unit) + unit)) {
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
      this._updateChipMatrix({
        egglement: element,
        add: true
      })
    },

    selectStopHandler (selectionBox) {
      if ((selectionBox.top === selectionBox.bottom && selectionBox.left === selectionBox.right) ||
          (this.page.children.length === 0)) return

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
          this._addSelectedElement(child)
        }
      })

      if (this.selectedElements.length > 0) {
        let cells = []
        this.selectedElements.forEach(element => {
          cells.push({
            row: Math.round(element.top / element.height),
            col: Math.round(element.left / element.width),
            painted: false
          })
        })
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
      this.selectedElements.forEach(acEl => {
        for (let i = 0; i < acEl.classes.matrix.length; i++) {
          for (let j = 0; j < acEl.classes.matrix[i].length; j++) {
            if (acEl.classes.matrix[i][j] !== 0) {
              this.chip.matrix[acEl.initialPos.top * 10 / this.gridUnit.current + i][acEl.initialPos.left * 10 / this.gridUnit.current + j] = 0
            }
          }
        }
      })
      if (this.checkCollision(this.selectedElements)) {
          this.selectedElements.forEach(acEl => {
            for (let i = 0; i < acEl.classes.matrix.length; i++) {
              for (let j = 0; j < acEl.classes.matrix[i].length; j++) {
                if (acEl.classes.matrix[i][j] !== 0) {
                  this.chip.matrix[acEl.initialPos.top * 10 / this.gridUnit.current + i][acEl.initialPos.left * 10 / this.gridUnit.current + j] = 1
                }
              }
            }
            this.moveElement({ elId: acEl.id, pageId: this.page.id, top: acEl.initialPos.top, left: acEl.initialPos.left })
          })
        return
      }

      const containegg = this.getContaineggOnPoint(moveStopData.absMouseX, moveStopData.absMouseY)
      const parentId = containegg ? containegg.id : null

      moveStopData.moveElData.map(moveData => {
        this.moveElement({
        ...moveData,
        pageId: this.page.id,
        parentId,
        mouseX: moveStopData.relMouseX,
        mouseY: moveStopData.relMouseY
        })
      })

      this.selectedElements.map(el => {
        this.updateElement({
          egglement: el,
          initialPos: {
            'top': el.top,
            'left': el.left
          }
        })
        this._updateChipMatrix({
          egglement: el,
          add: true
        })
      })

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

    ...mapActions([rebaseSelectedElements, registerElement, removeElement, resizeElement, moveElement, margeSelectedElements, separateElement]),
    ...mapMutations([_clearSelectedElements, _addSelectedElement, updateElement, _updateChipMatrix])
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

button {
  height: 200px;
  width: 200px;
  font-size: 50px;
  position: fixed;
  top: 0;
  right: 0;
}
</style>
