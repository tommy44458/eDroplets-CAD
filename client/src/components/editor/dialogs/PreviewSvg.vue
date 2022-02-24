<template>
  <dialog class="dialog" >
    <div class="confirm-dialog__content">
      <svg width="1000" height="600" viewBox="-225 -600 1250 500" v-html="svgContent">
      </svg>
    </div>
    <div class="confirm-dialog__actions">
      <!-- <mdc-button @click="onConfirm" class="confirm-dialog__delete-btn" unelevated>Delete</mdc-button> -->
      <mdc-button @click="closeDialog">Confirm</mdc-button>
    </div>
  </dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { clearProject, getSVG } from '@/store/types'
import dialogPolyfill from 'dialog-polyfill/dialog-polyfill'

export default {
  name: 'preview-svg',
  created: function () {
    this.$root.$on('preview-svg', this.openDialog)
  },
  data () {
    return {
    }
  },
  beforeDestroy: function () {
    this.$root.$off('preview-svg', this.openDialog)
  },
  computed: {
    ...mapState({
      project: state => state.project,
      svgContent: state => state.app.svgContent
    })
  },
  methods: {
    openDialog () {
      if (!this.$el.showModal) {
        dialogPolyfill.registerDialog(this.$el)
      }
      this.$el.showModal()
      this.getSVG()
    },

    onConfirm () {
      this.clearProject()
      this.closeDialog()
    },

    closeDialog () {
      this.$el.close()
    },

    ...mapActions([clearProject, getSVG])
  },
  mounted () {
    console.log(this.svgContent)
  },
  watch: {
    // svgContent: function (val) {
    //   console.log('*********')
    // }
  }
}
</script>


<style scoped>
dialog {
  height: 92% !important;
  width: 70% !important;
}

.confirm-dialog__title {
  font-size: 24px;
  font-weight: 500;
  padding: 24px 24px 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.confirm-dialog__content {
  padding: 20px 24px 24px;
  color: rgba(0,0,0,.54);
}
.confirm-dialog__content .confirm-dialog__input{
  width: 100%;
}

.confirm-dialog__actions {
  padding: 8px 8px 8px 24px;
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap;
}

.confirm-dialog__delete-btn {
  background-color: #ea493f !important;
}
</style>
