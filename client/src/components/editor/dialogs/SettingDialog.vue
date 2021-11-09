<template>
  <dialog>
    <p class="confirm-dialog__title">New EWOD chip</p>
    <div class="confirm-dialog__content">
      <p>
        If you create a new EWOD chip, all local changes will be lost!<br />
        ... using the new setting.
      </p>
      <p>
        chip grid: 
        <span>
          <input  v-model="gridUnit" @blur="onGridBlur"
          title="grid scale" placeholder="grid scale"/>
          <span>
            um
          </span>
        </span>
      </p>
    </div>
    <div class="confirm-dialog__actions">
      <mdc-button @click="onConfirm" class="confirm-dialog__delete-btn" unelevated>Apply</mdc-button>
      <mdc-button @click="closeDialog" v-if="parseInt(gridUnit) > 0">Cancel</mdc-button>
    </div>
  </dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { newProject } from '@/store/types'
import dialogPolyfill from 'dialog-polyfill/dialog-polyfill'
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'setting-dialog',
  created: function () {
    this.$root.$on('open-setting-dialog', this.openDialog)
  },
  beforeDestroy: function () {
    this.$root.$off('open-setting-dialog', this.openDialog)
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapFields([
      'app.gridUnit',
      'app.chip'
    ]),

    ...mapState({
      project: state => state.project
    })
  },
  methods: {
    openDialog () {
      if (!this.$el.showModal) {
        dialogPolyfill.registerDialog(this.$el)
      }
      this.$el.showModal()
    },

    onConfirm () {
      this.newProject({height: this.chip.height, width: this.chip.width, gridUnit: this.gridUnit, cornerSize: 3})
      this.closeDialog()
    },

    closeDialog () {
      this.$el.close()
    },

    onGridBlur () {

    },

    ...mapActions([newProject])
  }
}
</script>


<style scoped>
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
