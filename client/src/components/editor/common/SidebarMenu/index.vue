<template>
    <div class="sidebar">
        <div class="sidebar-content">
            <p>Square electrode size:</p>
            <span>
              <input type="number" :min="gridUnit" :step="gridUnit" onkeydown="return false" v-model.number="squareSize"/>
              <span>um</span>
            </span>
        </div>
        <div class="sidebar-content">
            <p>Snapping grids distance:</p>
            <span>
              <input type="number" min="1" step="1" onkeydown="return false" :value="snappingDistance" @change="changeSnappingDistance"/>
              <span>grids</span>
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
      'app.originalGridUnit'
    ]),
    snappingDistance () {
      return this.gridUnit / this.originalGridUnit
    }
  },
  methods: {
    changeSnappingDistance (e) {
      this.gridUnit = e.target.value * this.originalGridUnit
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