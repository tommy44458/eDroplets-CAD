<template>
    <div class="sidebar">
        <div v-if="substrate === 'glass'" class="sidebar-content">
            <p>Square electrode size:</p>
            <span>
              <input type="number" :min="gridUnit.current" :step="gridUnit.current" onkeydown="return false" v-model.number="squareSize"/>
              <span>um</span>
            </span>
        </div>
        <div v-if="substrate === 'glass'" class="sidebar-content">
            <p>Snapping grids distance:</p>
            <span>
              <input type="number" min="1" step="1" onkeydown="return false" :value="snappingDistance" @change="changeSnappingDistance"/>
              <span>grids</span>
            </span>   
        </div>
        <div class="sidebar-content">
            <p>Routing resolution:</p>
            <span>
              <input style="width: 65%;" type="range" id="res" name="res" min="0" max="1" step="0.01" :value="routingUnit" @change="changeRoutingResolution"/>
              <input style="width: 25%;" type="number" min="0" max="1" step="0.01" :value="routingUnit" @change="changeRoutingResolution"/>
              <span>Higher resolution takes more time routing</span>
            </span>
        </div>
    </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'sidebar-menu',
  computed: {
    ...mapFields([
      'app.gridUnit',
      'app.squareSize',
      'app.routingUnit',
      'app.substrate'
    ]),
    snappingDistance () {
      return this.gridUnit.current / this.gridUnit.origin
    }
  },
  methods: {
    changeSnappingDistance (e) {
      this.gridUnit.current = e.target.value * this.gridUnit.origin
    },
    changeRoutingResolution (e) {
      this.routingUnit = e.target.value
    }
  }
}
</script>

<style scoped>
.sidebar{
    background: #FAEDCD;
    position: fixed;
    top: 0;
    left: 0;
    width: 270px;
    height: 100%;
    padding: 50px 0;
    transition: all 0.5s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.sidebar-content{
  width: 85%;
    font-size: 20px;
}

input{
  width: 70%;
}

</style>