<template>
  <div data-mr-container="true"
    class="mr-container"
    tabindex="0"
    @click="$emit('closeContextMenu')"
    @click.right.stop.prevent="mouseRightClickHandler"
    @mousedown.capture="mouseDownHandler"
    @mouseup.capture="$root.$emit('paint-electrodes-disable')"
    @keydown.esc.stop.prevent="$emit('clearselection')"
    @keydown.delete.exact.stop.prevent="$emit('delete')"
    @keydown.ctrl.67.exact.stop.prevent="$emit('copy')"
    @keydown.meta.67.exact.stop.prevent="$emit('copy')"
    @keydown.ctrl.88.exact.stop.prevent="$emit('cut')"
    @keydown.meta.88.exact.stop.prevent="$emit('cut')"
    @keydown.ctrl.86.exact.stop.prevent="$emit('paste', currentRelPos)"
    @keydown.meta.86.exact.stop.prevent="$emit('paste', currentRelPos)"
    @keydown.ctrl.90.exact.stop.prevent="$emit('undo')"
    @keydown.meta.90.exact.stop.prevent="$emit('undo')"
    @keydown.ctrl.shift.90.exact.stop.prevent="$emit('redo')"
    @keydown.meta.shift.90.exact.stop.prevent="$emit('redo')"
    @keydown.up.stop.prevent="e => $emit('arrows', {direction: 'up', shiftKey: e.shiftKey})"
    @keydown.down.stop.prevent="e => $emit('arrows', {direction: 'down', shiftKey: e.shiftKey})"
    @keydown.left.stop.prevent="e => $emit('arrows', {direction: 'left', shiftKey: e.shiftKey})"
    @keydown.right.stop.prevent="e => $emit('arrows', {direction: 'right', shiftKey: e.shiftKey})"
    @drop.prevent="e => $emit('drop', e)"
    @dragover.prevent
  >
    <slot></slot>
    <div ref="selectionArea" v-show="selecting" class="selection-area"></div>
  </div>
</template>


<script>
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'mr-container',
  props: {
    activeElements: {
      type: Array,
      default: []
    },
    allElements: {
      type: Array,
      default: []
    },
    zoom: {
      type: Number,
      default: 1
    }
  },

  data: function () {
    return {
      offsetX: null,
      offsetY: null,
      initialAbsPos: {x: 0, y: 0},
      initialRelPos: {x: 0, y: 0},
      currentAbsPos: {x: 0, y: 0},
      currentRelPos: {x: 0, y: 0},
      selecting: false,
      moving: false,
      resizing: false,
      handle: null
    }
  },
  computed: {
    ...mapFields([
      'app.gridUnit',
      'app.edit.paint',
      'app.edit.erase',
      'app.edit.moveStage',
      'app.chip'
    ]),

    mrElements () {
      return this.activeElements.map(el => document.getElementById(el.id).parentElement)
    }
  },
  methods: {
    mouseRightClickHandler (e) {
      const mousePoint = this.getMouseRelPoint(e)
      this.$emit('rightClick', mousePoint)
    },

    mouseDownHandler (e) {
      let isMrs = false
      this.initialAbsPos = this.getMouseAbsPoint(e)
      this.initialRelPos = this.getMouseRelPoint(e)

      if (this.paint || this.erase || e.target.dataset.mrContainer) {
        if (!e.shiftKey) {
          this.$emit('clearselection')
        }
        this.renderSelectionArea({x: -1, y: -1}, {x: -1, y: -1})
        isMrs = this.selecting = true
      } else if (e.target.dataset.mrHandle) {
        isMrs = this.resizing = true
        this.handle = e.target.classList[1]
        // this.$emit('resizestart')
      } else if (this.getParentMr(e.target)) {
        // this.$emit('combine')
        isMrs = this.moving = true
        // this.$emit('movestart')
      }

      if (isMrs) {
        document.documentElement.addEventListener('mousemove', this.mouseMoveHandler, true)
        document.documentElement.addEventListener('mouseup', this.mouseUpHandler, true)
      }
      if (this.moveStage) {
        this.$emit('setStageLastPos')
      }
    },

    mouseUpHandler (e) {
      // Saves the scroll position before giving focus and sets it back after focus
      const mainContainer = document.getElementById('main')
      let currentScroll = mainContainer.scrollTop
      this.$el.focus()
      mainContainer.scrollTop = currentScroll

      // if (this.initialAbsPos !== this.currentAbsPos) {
      if (this.resizing) {
        this.$emit('resizestop', this.resizeStopData())
      } else if (this.moving) {
        this.$emit('movestop', this.moveStopData())
      } else if (this.selecting) {
        this.$emit('selectstop', this.selectStopData())
      }

      this.moving = false
      this.resizing = false
      this.selecting = false
      this.handle = null
      this.offsetX = null
      this.offsetY = null

      document.documentElement.removeEventListener('mousemove', this.mouseMoveHandler, true)
      document.documentElement.removeEventListener('mouseup', this.mouseUpHandler, true)
    },

    mouseMoveHandler (e) {
      const lastAbsX = this.currentAbsPos.x
      const lastAbsY = this.currentAbsPos.y

      // const elCompStyle = window.getComputedStyle(mrEl)
      const offX = this.getMouseAbsPoint(e).x - lastAbsX
      this.currentAbsPos.x = this.getMouseAbsPoint(e).x
      const posX = this.currentRelPos.x = this.getMouseRelPoint(e).x

      const offY = this.getMouseAbsPoint(e).y - lastAbsY
      this.currentAbsPos.y = this.getMouseAbsPoint(e).y
      const posY = this.currentRelPos.y = this.getMouseRelPoint(e).y

      if (this.resizing) {
        this.mrElements.map(mrEl => {
          if (!mrEl.children[0].dataset.global) this.resizeElementBy(mrEl, offX, offY)
        })
        // this.$emit('resizing')
      } else if (this.moving) {
        // this.mrElements.map(mrEl => this.moveElementBy(mrEl, offX, offY))
        this.mrElements.map(mrEl => this.moveElementBy2(mrEl, posX, posY))
        this.$emit('moving', this.currentAbsPos.x, this.currentAbsPos.y)
      } else {
        this.currentAbsPos = this.getMouseAbsPoint(e)
        this.currentRelPos = this.getMouseRelPoint(e)
        if (this.paint) {
          this.$emit('add', this.currentRelPos)
        } else if (this.erase) {
          this.$emit('erase', this.currentRelPos)
        } else if (this.moveStage) {
          this.$emit('moveStage', [this.initialAbsPos, this.currentAbsPos])
        } else {
          this.renderSelectionArea(this.initialRelPos, this.currentRelPos)
        }
        // this.$emit('selecting')
      }
    },

    renderSelectionArea (initPoint, endPoint) {
      const minX = Math.min(initPoint.x, endPoint.x)
      const maxX = Math.max(initPoint.x, endPoint.x)
      const minY = Math.min(initPoint.y, endPoint.y)
      const maxY = Math.max(initPoint.y, endPoint.y)

      this.$refs.selectionArea.style.left = Math.round(minX / this.zoom) + 'px'
      this.$refs.selectionArea.style.top = Math.round(minY / this.zoom) + 'px'
      this.$refs.selectionArea.style.width = Math.round((maxX - minX) / this.zoom) + 'px'
      this.$refs.selectionArea.style.height = Math.round((maxY - minY) / this.zoom) + 'px'
    },

    resizeElementBy (el, offX, offY) {
      const parentCompStyle = window.getComputedStyle(this.getParentMr(el))
      const elCompStyle = window.getComputedStyle(el)

      const parentH = parseInt(parentCompStyle.height)
      const parentW = parseInt(parentCompStyle.width)
      const elMinH = parseInt(elCompStyle.minHeight)
      const elMinW = parseInt(elCompStyle.minWidth)

      let newTop = parseInt(elCompStyle.top)
      let newLeft = parseInt(elCompStyle.left)
      let newRight = parseInt(elCompStyle.right)
      let newBottom = parseInt(elCompStyle.bottom)
      let newHeight = parseInt(elCompStyle.height)
      let newWidth = parseInt(elCompStyle.width)

      let diffX = offX
      let diffY = offY

      if (this.handle.indexOf('t') !== -1) {
        if (newHeight - offY < elMinH) diffY = (newHeight - elMinH)
        else if (newTop + offY < 0) diffY = (0 - newTop)
        newTop += Math.round(diffY / this.zoom)
        newHeight -= Math.round(diffY / this.zoom)
      }
      if (this.handle.indexOf('l') !== -1) {
        if (newWidth - offX < elMinW) diffX = (newWidth - elMinW)
        else if (newLeft + offX < 0) diffX = (0 - newLeft)
        newLeft += Math.round(diffX / this.zoom)
        newWidth -= Math.round(diffX / this.zoom)
      }
      if (this.handle.indexOf('b') !== -1) {
        if (newHeight + offY < elMinH) diffY = (elMinH - newHeight)
        else if (newTop + newHeight + offY > parentH) diffY = (parentH - newTop - newHeight)
        newHeight += Math.round(diffY / this.zoom)
        newBottom -= Math.round(diffY / this.zoom)
      }
      if (this.handle.indexOf('r') !== -1) {
        if (newWidth + offX < elMinW) diffX = (elMinW - newWidth)
        else if (newLeft + newWidth + offX > parentW) diffX = (parentW - newLeft - newWidth)
        newWidth += Math.round(diffX / this.zoom)
        newRight -= Math.round(diffX / this.zoom)
      }

      el.style.height = (el.style.height !== 'auto') ? newHeight + 'px' : 'auto'
      el.style.width = (el.style.width !== 'auto') ? newWidth + 'px' : 'auto'
      el.style.top = (el.style.top !== 'auto') ? newTop + 'px' : 'auto'
      el.style.left = (el.style.left !== 'auto') ? newLeft + 'px' : 'auto'
      el.style.bottom = (el.style.bottom !== 'auto') ? newBottom + 'px' : 'auto'
      el.style.right = (el.style.right !== 'auto') ? newRight + 'px' : 'auto'
    },

    moveElementBy (el, offX, offY) {
      const elCompStyle = window.getComputedStyle(el)

      // Re-set height and width on move to preserve dimensions (due addition of bottom/right props)
      el.style.height = el.style.height
      el.style.width = el.style.width

      el.style.top = (el.style.top !== 'auto')
        ? this.fixPosition(el, parseInt(elCompStyle.top) + Math.round(offY / this.zoom), 'top') + 'px'
        : 'auto'
      el.style.left = (el.style.left !== 'auto')
        ? this.fixPosition(el, parseInt(elCompStyle.left) + Math.round(offX / this.zoom), 'left') + 'px'
        : 'auto'
      el.style.bottom = (el.style.bottom !== 'auto')
        ? this.fixPosition(el, parseInt(elCompStyle.bottom) - Math.round(offY / this.zoom), 'bottom') + 'px'
        : 'auto'
      el.style.right = (el.style.right !== 'auto')
        ? this.fixPosition(el, parseInt(elCompStyle.right) - Math.round(offX / this.zoom), 'right') + 'px'
        : 'auto'
    },

    // checkCollision (selectedEls, allEls) {
    //   const unit = 21
    //   const acElPos = []
    //   const alElPos = []
    //   selectedEls.forEach(acEl => {
    //     const acElX = parseInt(acEl.left / unit)
    //     const acElY = parseInt(acEl.top / unit)
    //     if (acEl.matrix != null && acEl.matrix.length > 0) {
    //       acEl.matrix.forEach((acRow, acI) => {
    //         acRow.forEach((acItem, acJ) => {
    //           acElPos.push([acElX + acJ, acElY + acI])
    //         })
    //       })
    //     }
    //   })
    //   allEls.forEach(alEl => {
    //     const alElX = parseInt(alEl.left / unit)
    //     const alElY = parseInt(alEl.top / unit)
    //     if (alEl.matrix != null && alEl.matrix.length > 0) {
    //       alEl.matrix.forEach((alRow, alI) => {
    //         alRow.forEach((alItem, alJ) => {
    //           alElPos.push([alElX + alJ, alElY + alI])
    //         })
    //       })
    //     }
    //   })
    //   console.log(acElPos, alElPos)
    //   acElPos.forEach(acPos => {
    //     alElPos.forEach(alPos => {
    //       if (acPos.toString() === alPos.toString()) {
    //         return true
    //       }
    //     })
    //   })
    //   return false
    // },

    moveElementBy2 (el, posX, posY) {
      const unit = this.gridUnit.current / 10
      const unitX = parseInt((posX / this.zoom) / unit)
      const unitY = parseInt((posY / this.zoom) / unit)

      const offsetEl = []
      const lastElPos = []

      this.activeElements.forEach(acEl => {
        const acElX = parseInt(acEl.left / unit)
        const acElY = parseInt(acEl.top / unit)
        lastElPos.push([acEl.left, acEl.top])
        offsetEl.push([parseInt(this.activeElements[0].left / unit) - acElX, parseInt(this.activeElements[0].top / unit) - acElY])
      })
      const initMousePosX = this.initialRelPos.x
      const initMousePosY = this.initialRelPos.y
      this.$emit('mousemove', {offsetEl, unitX, unitY, lastElPos, initMousePosX, initMousePosY})
    },

    fixPosition (el, val, prop) {
      if (val < 0) return 0

      const parentCompStyle = window.getComputedStyle(this.getParentMr(el))
      const elCompStyle = window.getComputedStyle(el)

      if ((prop === 'top' || prop === 'bottom') && (val + parseInt(elCompStyle.height) > parseInt(parentCompStyle.height))) {
        return parseInt(parentCompStyle.height) - parseInt(elCompStyle.height)
      }
      if ((prop === 'left' || prop === 'right') && (val + parseInt(elCompStyle.width) > parseInt(parentCompStyle.width))) {
        return parseInt(parentCompStyle.width) - parseInt(elCompStyle.width)
      }
      return val
    },

    getParentMr (element) {
      let parentMr = null
      let currentMr = element

      while (parentMr === null) {
        if (currentMr === null || currentMr.parentElement === null) break
        else if (currentMr.dataset.mrContainer) parentMr = currentMr
        else if (currentMr.parentElement.dataset.mrEl) parentMr = currentMr.parentElement

        currentMr = currentMr.parentElement
      }
      return parentMr
    },

    getMouseAbsPoint (e) {
      return {x: e.clientX, y: e.clientY}
    },

    getMouseRelPoint (e) {
      const mainContainer = document.getElementById('main')
      const x = e.clientX + mainContainer.scrollLeft - mainContainer.offsetLeft - this.$el.offsetLeft
      const y = e.clientY + mainContainer.scrollTop - mainContainer.offsetTop - this.$el.offsetTop

      return {x, y}
    },

    moveStopData () {
      return {
        moveElData: this.mrElements.map(el => {
          return {
            elId: el.childNodes[0].id,
            top: (el.style.top.indexOf('%') !== -1 || el.style.top === 'auto')
              ? el.style.top
              : parseInt(el.style.top),
            left: (el.style.left.indexOf('%') !== -1 || el.style.left === 'auto')
              ? el.style.left
              : parseInt(el.style.left),
            bottom: (el.style.bottom.indexOf('%') !== -1 || el.style.bottom === 'auto')
              ? el.style.bottom
              : parseInt(el.style.bottom),
            right: (el.style.right.indexOf('%') !== -1 || el.style.right === 'auto')
              ? el.style.right
              : parseInt(el.style.right)
          }
        }),
        relMouseX: Math.round(this.currentRelPos.x / this.zoom),
        relMouseY: Math.round(this.currentRelPos.y / this.zoom),
        absMouseX: this.currentAbsPos.x,
        absMouseY: this.currentAbsPos.y
      }
    },

    resizeStopData () {
      return this.mrElements.map(el => {
        return {
          elId: el.childNodes[0].id,
          top: (el.style.top.indexOf('%') !== -1 || el.style.top === 'auto')
            ? el.style.top
            : parseInt(el.style.top),
          left: (el.style.left.indexOf('%') !== -1 || el.style.left === 'auto')
            ? el.style.left
            : parseInt(el.style.left),
          bottom: (el.style.bottom.indexOf('%') !== -1 || el.style.bottom === 'auto')
            ? el.style.bottom
            : parseInt(el.style.bottom),
          right: (el.style.right.indexOf('%') !== -1 || el.style.right === 'auto')
            ? el.style.right
            : parseInt(el.style.right),
          height: (el.style.height.indexOf('%') !== -1 || el.style.height === 'auto')
            ? el.style.height
            : parseInt(el.style.height),
          width: (el.style.width.indexOf('%') !== -1 || el.style.width === 'auto')
            ? el.style.width
            : parseInt(el.style.width)
        }
      })
    },

    selectStopData () {
      return {
        top: parseInt(this.$refs.selectionArea.style.top),
        bottom: parseInt(this.$refs.selectionArea.style.height) + parseInt(this.$refs.selectionArea.style.top),
        left: parseInt(this.$refs.selectionArea.style.left),
        right: parseInt(this.$refs.selectionArea.style.width) + parseInt(this.$refs.selectionArea.style.left)
      }
    }
  }
}
</script>


<style scoped>
.mr-container {
  position: relative;
  outline: none;
}

.selection-area {
  position: absolute;
  border: 1px solid #03a9f4;
  background-color: rgba(3, 169, 244, .08);
}
</style>
