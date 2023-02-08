<template>
  <dialog>
    <p class="confirm-dialog__title">New Canvas</p>
    <div class="confirm-dialog__content">
      <p>
        A new canvas will be created with <br />
        specified grid size below.<br />
        Note that all the electrodes on the<br />
        existing canvas will not be saved!<br />
      </p>
      <p>
        Substrate Type: 
        <span :key="key">
          <select v-model="substrate">
            <option value="glass"> Glass </option>
            <option value="paper"> Paper </option>
          </select>
        </span>
      </p>
      <p v-if="substrate == 'glass'">
        Canvas Grid:
        <span :key="keyInput">
          <input
            style="width: 100px;"
            type="number"
            min="500"
            max="5000"
            step="500"
            :value="gridUnit.current"
            @change="autoAdjust"
            @blur="onGridBlur"
            title="grid scale"
            placeholder="grid scale"/>
          <span>
            um
          </span>
        </span>
        <span class="invalid-message" v-if="invalidInput">
          <p>  
            Invalid grid size input!
          </p>
        </span>
      </p>
      <p v-else>
        <span>
          Currently not supported
        </span>
      </p>
    </div>
    <div class="confirm-dialog__actions">
      <mdc-button v-if="substrate == 'glass'" @click="onConfirm" class="confirm-dialog__delete-btn" unelevated>Apply</mdc-button>
      <mdc-button v-else disabled unelevated>Apply</mdc-button>
      <mdc-button @click="closeDialog" v-if="parseInt(gridUnit.current) > 0">Cancel</mdc-button>
    </div>
  </dialog>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import { newProject, _updateGridUnit } from '@/store/types'
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
      key: 0,
      keyInput: 0,
      substrate: 'glass',
      invalidInput: false
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
      this.newProject({
        height: this.chip.height,
        width: this.chip.width,
        gridUnit: this.gridUnit.current,
        cornerSize: 5,
        gapSize: 0.5
      })
      this.closeDialog()
    },

    closeDialog () {
      this.$el.close()
    },

    onGridBlur () {

    },

    autoAdjust (e) {
      this.invalidInput = false
      let newVal = e.target.value
      const autoAdjustScale = 100
      if (newVal % autoAdjustScale !== 0) {
        let scale = Math.floor(newVal / autoAdjustScale)
        if (newVal - autoAdjustScale * scale < (autoAdjustScale / 2)) {
          newVal = autoAdjustScale * scale
        } else {
          newVal = autoAdjustScale * (scale + 1)
        }
        this.invalidInput = true
      }
      if (newVal > 5000) {
        newVal = 5000
        this.invalidInput = true
      } else if (newVal < 500) {
        newVal = 500
        this.invalidInput = true
      }
      this._updateGridUnit(newVal)
      if (this.invalidInput) {
        this.keyInput++
      }
    },
    ...mapActions([newProject]),
    ...mapMutations([_updateGridUnit])
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

.invalid-message {
  color: red;
}
</style>
