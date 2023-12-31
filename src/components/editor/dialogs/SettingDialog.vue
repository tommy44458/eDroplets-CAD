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
          <select v-model="substrateType" @change="onSwitchSubstrate">
            <option value="glass"> Glass </option>
            <option value="paper"> Paper </option>
          </select>
        </span>
      </p>
      <p v-if="substrateType == 'glass'">
        Canvas Grid:
        <span :key="keyInput">
          <input
            style="width: 100px;"
            type="number"
            min="500"
            max="5000"
            step="500"
            :value="grid"
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
        Canvas Grid:
        <span :key="key">
          <select :value=1300>
            <option value=1300> 1300 </option>
          </select>
        </span>
        <span>
            um
        </span>
      </p>
    </div>
    <div class="confirm-dialog__actions">
      <mdc-button @click="onConfirm" class="confirm-dialog__delete-btn" unelevated>Apply</mdc-button>
      <mdc-button @click="closeDialog">Cancel</mdc-button>
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
      key: 0,
      keyInput: 0,
      substrateType: 'glass',
      invalidInput: false,
      grid: 0
    }
  },
  computed: {
    parameterTable() {
      return {
        'glass': {
          'cornerSize': 5,
          'gapSize': 0.5
        },
        'paper': {
          'cornerSize': 0,
          'gapSize': 30
        }
      }
    },

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
      this.substrateType = this.project.substrate
      this.grid = this.gridUnit.current
      if (!this.substrateType) {
        this.substrateType = this.grid === 1300 ? 'paper' : 'glass'
      }
      if (!this.$el.showModal) {
        dialogPolyfill.registerDialog(this.$el)
      }
      this.$el.showModal()
    },

    onConfirm () {
      if (this.invalidInput) {
        return
      }
      this.newProject({
        substrate: this.substrateType,
        height: this.chip.height,
        width: this.chip.width,
        gridUnit: this.grid,
        cornerSize: this.parameterTable[this.substrateType].cornerSize,
        gapSize: this.parameterTable[this.substrateType].gapSize
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
      this.grid = newVal
      if (this.invalidInput) {
        this.keyInput++
      }
    },

    onSwitchSubstrate (e) {
      if (e.target.value === 'paper') {
        this.grid = 1300
      } else {
        this.grid = 2000
      }
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

.invalid-message {
  color: red;
}
</style>
