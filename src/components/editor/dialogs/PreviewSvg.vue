<template>
  <dialog class="dialog" @click="closeDialog">
    <div class="confirm-dialog__content" >
        <svg style="text-align: center;" viewBox="0 0 787 458" v-html="svgContent" />
    </div>
  </dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { resetProject, getSVG } from '@/store/types'
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
      if (!this.getSVG()) {
        this.$root.$emit('open-api-fail-dialog')
      }
    },

    onConfirm () {
      this.resetProject()
      this.closeDialog()
    },

    closeDialog () {
      this.$el.close()
    },

    ...mapActions([resetProject, getSVG])
  },
  mounted () {
    console.log(this.svgContent)
  },
  watch: {
  }
}
</script>


<style scoped>
dialog {
    min-width: 300px;
    min-height: 300px;
  height: 70% !important;
  width: 70% !important;
  text-align: center;
}

.confirm-dialog__title {
  text-align: center;
  font-size: 24px;
  font-weight: 500;
  padding: 24px 24px 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.confirm-dialog__content {
  padding: 5px;
  color: rgba(255, 255, 255, 0.54);
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
