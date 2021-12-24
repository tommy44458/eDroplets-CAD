<template>
    <div class="sidebar">
        <div class="sidebar-content">
            <p>Square electrode size:</p>
            <span>
              <input v-model.number="squareSize"/>
              <span>um</span>
            </span>
        </div>
        <div class="sidebar-content">
            <p>Snapping grids distance:</p>
            <span>
              <input :value="snappingDistance" @change="changeSnappingDistance"/>
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
      'app.squareSize'
    ]),
    snappingDistance () {
      return this.gridUnit / 1000
    }
  },
  methods: {
    changeSnappingDistance (e) {
      this.gridUnit = e.target.value * 1000
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