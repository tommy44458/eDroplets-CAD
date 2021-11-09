<template>
  <div class="mainegg main-container">
    <stage
      class="main-stage"
      :style="{
        top: stagePosTop + 'px',
        left: stagePosLeft + 'px',
      }"
      v-if="selectedPage"
      :page="selectedPage"
      :zoom="zoom">
    </stage>
    <zoom-menu @zoomChange="zoomHandler" :zoom="zoom" class="zoom-menu"></zoom-menu>
  </div>
</template>


<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import { _changeActivePage, _rebaseActivePage, _updateEditorZoom, getPageIndexById } from '@/store/types'

import ZoomMenu from '@/components/editor/common/ZoomMenu'
import Stage from './Stage'
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'mainegg',
  components: { Stage, ZoomMenu },
  created: function () {
    this.selectFallbackPage(this.selectedPage)
  },
  computed: {
    ...mapFields([
      'app.stagePosTop',
      'app.stagePosLeft',
      'app.edit.moveStage'
    ]),
    ...mapState({
      selectedPage: state => state.app.selectedPage,
      pages: state => state ? state.project.pages : [],
      zoom: state => state.app.editorZoom
    }),
    ...mapGetters([getPageIndexById])
  },
  watch: {
    // After a redo/undo action this will apply
    selectedPage: function (val) {
      this.selectFallbackPage(val)
    }
  },
  methods: {
    selectFallbackPage (page) {
      if (!page && this.pages.length > 0) {
        this._changeActivePage(this.pages[0])
      } else {
        this._rebaseActivePage(this.getPageIndexById(page.id))
      }
    },

    zoomHandler (zoomValue) {
      this._updateEditorZoom(zoomValue)
    },

    ...mapMutations([_changeActivePage, _rebaseActivePage, _updateEditorZoom])
  }
}
</script>

<style scoped>
.mainegg {
  margin: 0px 0px; 
  height: 100%;
  width: 100%;
  background-color: #f3eedc;
}

.main-container {
  /* display: flex; */
  justify-content: center; 
  align-items: center; 
}

.main-stage {
  position: relative;
}

.zoom-menu {
  bottom: 24px;
  left: 24px;
  padding: 0 0px;
  position: fixed;
}
</style>
