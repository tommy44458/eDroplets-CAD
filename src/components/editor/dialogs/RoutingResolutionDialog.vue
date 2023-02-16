<template>
  <dialog>
    <p class="confirm-dialog__title">Routing Resolution</p>
    <div class="confirm-dialog__content">
      <p>Routing resolution:</p>
      <span>
        <input style="width: 72%;" type="range" id="res" name="res" min="0" max="1" step="0.01" :value="routingResolution" @change="changeRoutingResolution"/>
        <input style="width: 18%;" type="number" min="0" max="1" step="0.01" :value="routingResolution" @change="changeRoutingResolution"/>
      </span>
      <p>Higher resolution takes more time routing.</p>
    </div>
    <div class="confirm-dialog__actions">
      <mdc-button @click="onConfirm" class="confirm-dialog__delete-btn" unelevated>Apply</mdc-button>
      <mdc-button @click="closeDialog">Cancel</mdc-button>
    </div>
  </dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { downloadProjectDXF } from '@/store/types'
import dialogPolyfill from 'dialog-polyfill/dialog-polyfill'
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'routing-resolution-dialog',
  created: function () {
    this.$root.$on('open-routing-resolution', this.openDialog)
  },
  beforeDestroy: function () {
    this.$root.$off('open-routing-resolution', this.openDialog)
  },
  data () {
    return {
      routingResolution: 0.2
    }
  },
  computed: {
    ...mapFields([
      'app.gridUnit',
      'app.routingUnit'
    ]),
    ...mapState({
      project: state => state.project
    })
  },
  methods: {
    openDialog () {
      if (this.routingUnit === 1) {
        this.routingResolution = 0
      } else {
        this.routingResolution = this.routingUnit / this.gridUnit.origin * 100
      }
      if (!this.$el.showModal) {
        dialogPolyfill.registerDialog(this.$el)
      }
      this.$el.showModal()
    },
    changeRoutingResolution (e) {
      this.routingResolution = e.target.value
      this.routingUnit = this.gridUnit.origin / 100 * this.routingResolution
      if (this.routingUnit === 0) {
        this.routingUnit = 1
      }
    },
    onConfirm () {
      if (!this.downloadProjectDXF()) {
          this.$root.$emit('open-api-fail-dialog')
      }
      this.closeDialog()
    },
    closeDialog () {
      this.$el.close()
    },

    ...mapActions([downloadProjectDXF])
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
