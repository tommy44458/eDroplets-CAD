<template>
  <div class="headegg mdc-theme--background" :class="{'not-scrolled': scroll0}">
    <!-- <user-menu></user-menu> -->
    <div class="title-container">
      <button
        v-tooltip="'Other canvas options'"
        class="action-btn"
        @click="() => {
          openSidebar = !openSidebar
        }"
      >
        <div>
          <svgicon icon="system/actions/menu" width="24" height="24">
          </svgicon>
        </div>
      </button>
      <div class="home-btn" style="display: flex; align-items: center;" >
        <!-- <svgicon icon="product/vuegg" width="40" height="40" :original="true"></svgicon> -->
        <!-- <p style="font-size:24px; font-weight: bold; color: #005587; text-align: center;">
            eDroplets
        </p> -->
        <!-- <img src="/static/eDroplets_logo.png" height="40"/> -->
        <svgicon icon="system/edroplets_logo" height="40" wight="40" />
      </div>
      <p class="title-prefix">
        Project Title:
      </p>
      <input
        class="title-input"
        v-model="tmpProjectTitle"
        @blur="onTitleBlur"
        title="Project title"
        placeholder="Project title"
      />
    </div>
    <action-bar></action-bar>
  </div>
</template>


<script>
import { mapState, mapMutations } from 'vuex'
import { updateProject } from '@/store/types'
import { mapFields } from 'vuex-map-fields'

import UserMenu from './UserMenu'
import ActionBar from './ActionBar'

import '@/assets/icons/product/vuegg'
import '@/assets/icons/system/edroplets_logo'
// import '@/assets/icons/system/elements/electrod/standard'

export default {
  name: 'headegg',
  components: { ActionBar, UserMenu },
  props: ['scroll0'],
  data: function () {
    return {
      tmpProjectTitle: ''
    }
  },
  computed: {
    ...mapState({
      project: state => state ? state.project : {},
      projectTitle: state => state ? state.project.title : ''
    }),
    ...mapFields([
      'app.openSidebar'
    ])
  },
  methods: {
    onTitleBlur () {
      if (this.tmpProjectTitle && (this.tmpProjectTitle !== this.projectTitle)) {
        this.updateProject({title: this.tmpProjectTitle})
      } else {
        this.tmpProjectTitle = this.projectTitle
      }
    },
    ...mapMutations([updateProject])
  },
  created: function () {
    this.tmpProjectTitle = this.projectTitle
  },
  watch: {
    'projectTitle': function (val) {
      this.tmpProjectTitle = val
    }
  }
}
</script>


<style scoped>

.headegg {
  z-index: 1000;
  height: 60px;
  width: 100%;
  background: #FAEDCD;
  border: 1px solid #A06933;
  /* calc(100% - 240px); */
  /* color: rgba(0,0,0,0.66); */
  padding: 5px 25px 5px 25px;
  /* margin-right: 0; */
  /* border: none; */
  display: flex;
  flex-shrink: 0;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-self: stretch;
  align-items: center;
  box-sizing: border-box;
  box-shadow:
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12),
    0 3px 1px -2px rgba(0, 0, 0, 0.2);

  transition-duration: .2s;
  transition-timing-function: cubic-bezier(.4,0,.2,1);
  transition-property: max-height,box-shadow;
}
.not-scrolled {
  box-shadow: none;
}

/* IN DEVICES SMALLER THAN 1024px -> NO DRAWER (so remove margins) */
@media screen and (max-width: 1024px) {
  .headegg {
    margin: 0px;
    width: 100%;
  }
}

.home-btn {
  margin-right: 25px;
  margin-left: 10px;
  border: none;
  border-radius: 50%;
  padding: 0;
  background-color: transparent;
  outline: none;
}

.spacer {
  width: 12px;
}

.title-prefix {
    font-size: 16px;
    font-weight: 500;
    margin-right: 10px;
}

.title-input {
  flex-grow: 1;
  border: 0;
  width: 300px;
  height: 56px;
  background: transparent;
  outline: none;
}

.title-container{
  height: 50px;
  display: flex;
  align-items: center;
}

.action-bar__wrapper {
  height: 100%;
  display: flex;
  flex-shrink: 0;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-self: stretch;
  align-items: center;
  box-sizing: border-box;
}

.action-btn {
  height: 36px;
  width: 36px;
  min-width: 28px;
  min-height: 28px;
  padding: 1px;
  margin: 0 6px;
  border-radius: 100%;

  background-color: transparent;
  border: 0px none;
  user-select: none;
  outline: none;
}
.action-btn:hover {
  background-color: rgba(43, 106, 115, 0.038);
}
.action-btn:active {
  background-color: rgba(43, 106, 115, 0.38);
}
.action-btn * {
  vertical-align: middle;
}
</style>
