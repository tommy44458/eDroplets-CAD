<template>
  <div class="action-bar__wrapper">
    <button v-if="isSyncing" title="syncing" :disabled="true" class="action-btn syncing">
      <svgicon icon="system/actions/sync" width="24" height="24" color="rgba(0,0,0,.38)"></svgicon>
    </button>

    <button v-tooltip="'Undo'" class="action-btn" :disabled="!canUndo" @click="$root.$emit('undo')">
      <svgicon icon="system/actions/undo" width="24" height="24"
        :color="canUndo ? '#2b6a73' : 'rgba(0,0,0,.38)'">
      </svgicon>
    </button>

    <button v-tooltip="'Redo'" class="action-btn" :disabled="!canRedo" @click="$root.$emit('redo')">
      <svgicon icon="system/actions/redo" width="24" height="24"
        :color="canRedo ? '#2b6a73' : 'rgba(0,0,0,.38)'">
      </svgicon>
    </button>

    <!-- <router-link :to="{name: 'preview'}">
      <button v-tooltip="'Preview'" class="action-btn">
        <svgicon icon="system/actions/preview" width="24" height="24" color="#2b6a73"></svgicon>
      </button>
    </router-link> -->

    <button v-tooltip="'Preview routing result'" class="action-btn" @click="$root.$emit('preview-svg')" >
      <svgicon icon="system/actions/preview" width="24" height="24" color="#2b6a73"></svgicon>
    </button>

    <div class="separator"></div>

    <button
      v-tooltip="'Move canvas'"
      class="action-btn"
      :disabled="isLoading"
      @click="() => {
       moveStage = !moveStage 
       paint = false
       erase = false
      }"
    >
      <div>
        <i class="far fa-hand-paper"></i>
        <svgicon icon="system/actions/hand" width="20" height="20"
          :color="moveStage ? 'red' : '#2b6a73'">
        </svgicon>
      </div>
    </button>

    <button
      v-tooltip="'Paint Electrodes'"
      class="action-btn"
      :disabled="isLoading"
      @click="() => {
       paint = !paint
       erase = false
       moveStage = false 
      }"
    >
      <div>
        <svgicon icon="system/actions/pencil" width="20" height="20"
          :color="paint ? 'red' : '#2b6a73'">
        </svgicon>
      </div>
    </button>

    <button
      v-tooltip="'Erase Electrodes'"
      class="action-btn"
      :disabled="isLoading"
      @click="() => {
       erase = !erase
       paint = false
       moveStage = false 
      }"
    >
      <div>
        <svgicon icon="system/actions/eraser" width="20" height="20"
          :color="erase ? 'red' : '#2b6a73'">
        </svgicon>
      </div>
    </button>

    <!-- <button v-tooltip="'Combine Electrodes'" class="action-btn" :disabled="isLoading" @click="$root.$emit('combine-electrodes')">
      <svgicon icon="system/actions/combine" width="20" height="20"
        :color="'#2b6a73'">
      </svgicon>
    </button> -->

    <div class="separator"></div>

    <button v-tooltip="'New canvas'" class="action-btn"
      :disabled="isLoading" @click="$root.$emit('open-setting-dialog')">
      <svgicon icon="system/page" width="24" height="24" color="#2b6a73"></svgicon>
    </button>

    <button v-tooltip="'Clear canvas'" class="action-btn"
      :disabled="isLoading" @click="$root.$emit('open-confirm-dialog')">
      <svgicon icon="system/actions/delete" width="24" height="24" color="#2b6a73"></svgicon>
    </button>

    <mdc-menu-anchor>
      <button v-tooltip="'Open...'" class="action-btn" :disabled="isLoading" @click="showLoadFromMenu">
        <svgicon icon="system/actions/folder" width="24" height="24" color="#2b6a73"></svgicon>
      </button>
      <mdc-menu ref="loadFromMenu" @select="onSelectLoadFrom">
        <mdc-menu-item disabled>Open project:</mdc-menu-item>
        <mdc-menu-divider></mdc-menu-divider>
        <mdc-menu-item>
          <input type="file" ref="inputOpenLocal" @change="openLocalFile" :value="fileValue" accept=".ecc"/>
          Computer
        </mdc-menu-item>
        <!-- <mdc-menu-item>GitHub</mdc-menu-item> -->
      </mdc-menu>
    </mdc-menu-anchor>

    <mdc-menu-anchor>
      <button v-tooltip="'Download...'" class="action-btn" :disabled="isLoading" @click="showDownloadMenu">
        <svgicon icon="system/actions/download" width="24" height="24" color="#2b6a73"></svgicon>
      </button>
      <mdc-menu ref="downloadMenu" @select="onSelectDownload">
        <mdc-menu-item disabled>Download:</mdc-menu-item>
        <mdc-menu-divider></mdc-menu-divider>
        <mdc-menu-item>Ewds file (.ewds)</mdc-menu-item>
        <!-- <mdc-menu-item>EDrop Project (.edp)</mdc-menu-item> -->
        <mdc-menu-item>Dxf file (.dxf)</mdc-menu-item>
        <mdc-menu-item>EDrop Control Config (.ecc)</mdc-menu-item>
        <!-- <mdc-menu-item>Vue sources (.zip)</mdc-menu-item> -->
      </mdc-menu>
    </mdc-menu-anchor>

    <!-- <button v-tooltip="saveBtnTitle" class="action-btn" @click="$root.$emit('open-upload-dialog')"
      :disabled="!isLoggedIn || !hasChanges || (isLoggedIn && isLoading)"
    >
      <svgicon icon="system/actions/cloud_off" v-if="!isLoggedIn"
        width="24" height="24" color="rgba(0,0,0,.38)">
      </svgicon>
      <svgicon icon="system/actions/cloud_up" v-else-if="hasChanges"
        width="24" height="24" color="#2b6a73">
      </svgicon>
      <svgicon icon="system/actions/cloud_done" v-else
        width="24" height="24" color="rgba(0,0,0,.38)">
      </svgicon>
    </button> -->

    <!-- <div class="separator"></div> -->
  </div>
</template>


<script>
import { mapState, mapActions } from 'vuex'
import { resetProject, downloadProjectEWD, downloadProjectEWDS, downloadProjectECC, downloadProjectDXF, downloadVueSources, loadVueggProject } from '@/store/types'
import { mapFields } from 'vuex-map-fields'

import '@/assets/icons/system/actions'

export default {
  name: 'action-bar',
  data: function () {
    return {
      fileValue: null
    }
  },

  computed: {
    ...mapFields([
      'project',
      'app.gridUnit',
      'app.chip',
      'app.edit.paint',
      'app.edit.erase',
      'app.edit.moveStage'
    ]),

    saveBtnTitle () {
      return !this.isLoggedIn
        ? 'Login with GitHub to save project'
        : this.hasChanges
          ? 'Save in GitHub'
          : 'Nothing to save'
    },

    ...mapState({
      apiStatus: state => state.app.apiStatus,
      isLoading: state => state.app.isLoading,
      isSyncing: state => state.app.isSyncing,
      hasChanges: state => state.app.hasChanges,
      canUndo: state => state.app.canUndo,
      canRedo: state => state.app.canRedo,
      isLoggedIn: state => state.oauth.isAuthorized
    })
  },
  methods: {
    paintChange () {
      this.paint = !this.paint
    },

    // --- DOWNLOAD MENU METHODS
    showDownloadMenu () {
      this.$refs.downloadMenu.show()
    },
    onSelectDownload (selected) {
      switch (selected.index) {
        case 1:
            this.downloadProjectEWDS()
            break
        case 2:
            this.$root.$emit('open-routing-resolution')
            break
        case 3:
            this.downloadProjectECC()
            break
        default:
            break
        // case 1: this.downloadProjectEWD(); break
        // case 2: this.downloadProjectEWDS(); break
        // case 3: this.downloadProjectECC(); break
        // case 4:
        //   this.downloadProjectDXF()
        // break
        // // case SOURCES: this.downloadVueSources(); break
      }
    },

    // --- LOAD FROM MENU METHODS
    showLoadFromMenu () {
      this.$refs.loadFromMenu.show()
    },
    onSelectLoadFrom (selected) {
      const PC = 1
      const GITHUB = 2

      switch (selected.index) {
        case GITHUB: this.$root.$emit('open-load-dialog'); break
        case PC:
          this.fileValue = null
          this.$refs.inputOpenLocal.click()
          break
      }
    },
    openLocalFile (event) {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = e => this.loadVueggProject({origin: 'pc', content: e.target.result})
      reader.readAsText(file)
    },

    ...mapActions([resetProject, downloadProjectEWD, downloadProjectEWDS, downloadProjectECC, downloadProjectDXF, downloadVueSources, loadVueggProject])
  },
  mounted () {
  },
  watch: {
    // apiStatus: function (val) {
    //   console.log(val)
    //   if (!val) {
    //     this.$root.$emit('open-api-fail-dialog')
    //   }
    // }
  }
}
</script>


<style scoped>
.action-bar__wrapper {
  height: 100%;
  display: flex;
  flex-shrink: 0;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-self: stretch;
  align-items: center;
  box-sizing: border-box;
}

.action-btn {
  height: 36px;
  width: 36px;
  min-width: 28px;
  min-height: 28px;
  padding: 1px;
  margin: 0 6px;
  border-radius: 100%;

  background-color: transparent;
  border: 0px none;
  user-select: none;
  outline: none;
}
.action-btn:hover {
  background-color: rgba(43, 106, 115, 0.038);
}
.action-btn:active {
  background-color: rgba(43, 106, 115, 0.38);
}
.action-btn * {
  vertical-align: middle;
}

.mdc-menu {
  background-color: #fff;
  transform-origin: right top 0 !important;
  top: 0px !important;
  right: 0px;
  left: auto !important;
}
.mdc-menu-item input {
  display: none;
}

.separator {
  width: 1px;
  height: 16px;
  margin: 0 6px;
  background-color: rgba(0, 0, 0, 0.12);
}

.syncing {
  animation:spin 1s linear infinite;
}
@keyframes spin { 100% { transform:rotate(360deg); }}

</style>
