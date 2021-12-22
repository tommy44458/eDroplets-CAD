<template>
    <div class="sidebar">
        <div class="sidebar-content">
            <p>Square electrode size:</p>
            <span>
            <input v-model="gridUnit"/>
            <span>
                um
            </span>
        </span>
        </div>
        <div class="sidebar-content">
            <p>Snapping grids distance:</p>
            
        </div>
    </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'sidebar-menu',
  data () {
    return {
    }
  },
  computed: {
    ...mapFields([
      'app.gridUnit'
    ])
  },
  methods: {
  }
}
</script>

<style scoped>
.sidebar{
    background: #FAEDCD;
    position: fixed;
    top: 0;
    left: 0;
    width: 250px;
    height: 100%;
    padding: 50px 0;
    transition: all 0.5s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.sidebar-content{
    font-size: 20px;
}
</style>