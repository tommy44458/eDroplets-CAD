<template>
  <div class="contextmenu-wrap" v-show="status" :style="style">
    <ul class="contextmenu">
      <li @click.stop=""
        v-for="item in menu"
        class="contextmenu__item"
        :key="item.action || item.name"
        :id="item.action || item.name"
      >
        <div @click.stop="fnHandler(item)" class="button">
          <i v-if="icon" :class="item.icon"></i>
          <span>{{ item.name }}</span>
          <i
            class="el-icon-arrow-right"
            v-if="item.children && item.children.length > 0"
          ></i>
          <context-menu
            v-if="item.children && item.children.length > 0"
            :menu="item.children"
            :icon="icon"
            :resolve="resolve"
          ></context-menu>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'contextmenu',
  props: {
    customEvent: {
      type: Object
    },
    icon: {
      type: Boolean,
      default: true
    },
    axis: {
      type: Object,
      default () {
        return { x: null, y: null }
      }
    },
    menu: {
      type: Array,
      default () {
        return [
          { icon: 'el-icon-edit', name: 'move', action: 'move' },
          { icon: 'el-icon-setting', name: 'copy', action: 'copy' },
          { icon: 'el-icon-setting', name: 'paste', action: 'paste' },
          { icon: 'el-icon-setting', name: 'cut', action: 'cut' },
          { icon: 'el-icon-setting', name: 'delete', action: 'delete' },
          { icon: 'el-icon-setting', name: 'combine', action: 'combine' },
          { icon: 'el-icon-setting', name: 'separate', action: 'separate' }
        ]
      }
    },
    resolve: {
      type: Function,
      default: function (action) {
        switch (action) {
          case 'move':
            this.$emit('moving')
            break
          case 'copy':
            this.$emit('copy')
            break
          case 'paste':
            this.$emit('paste')
            break
          case 'cut':
            this.$emit('cut')
            break
          case 'delete':
            this.$emit('delete')
            break
          case 'combine':
            this.$emit('combine')
            break
          case 'separate':
            this.$emit('separate')
            break
        }
      }
    },
    reject: {
      type: Function,
      default: function () {}
    }
  },
  computed: {
    style () {
      let x = this.axis.x
      let y = this.axis.y
      let menuHeight = this.menu.length * 32
      let menuWidth = this.menu.width
      return {
        left:
          (document.body.clientWidth < x + menuWidth ? x - menuWidth : x + 10) +
          'px',
        top:
          (document.body.clientHeight < y + menuHeight ? y - menuHeight : y) +
          'px'
      }
    }
  },
  data () {
    return {
      status: false
    }
  },
  methods: {
    fnHandler (item) {
      this.status = false
      if (item.fn) item.fn(this.customEvent)
      this.resolve(item.action)
    }
  },
  mounted () {
    this.$nextTick(function () {
      this.status = true
    })
  }
}
</script>

<style scoped>
.contextmenu-wrap {
  display: block;
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  border-radius: 3rem;
  overflow: hidden;
  border: 1px solid #ccc;
}

contextmenu {
  margin: 0;
  padding: 0;
  -webkit-box-shadow: 0 0 5px #ccc;
          box-shadow: 0 0 5px #ccc;
  border: 2px solid #ccc;
}

.contextmenu__item {
  width: 30rem;
  height: 7rem;
  font-size: 5rem;
  line-height: 7rem;
  border-radius: 10rem;
  background: #fff;
  text-decoration: none;
  list-style: none;
  position: relative;
}

.button {
  cursor: pointer;
  width: 100%;
  height: 100%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  outline: 0;
  border: 0;
  background: #fff;
  padding: 0 1rem;
}

 .button > * {
  color: #333;
}

.button span {
  -webkit-box-flex: 1;
      -ms-flex: 1;
          flex: 1;
  text-align: left;
  margin-left: 5px;
}

.button i {
  text-align: center;
}

.contextmenu__item .button .contextmenu {
  position: absolute;
  right: calc(-100% - 2px);
  top: -1px;
  display: none;
}

.button:hover {
  -webkit-box-shadow: 0px 1px 3px rgba(34, 25, 25, 0.2);
          box-shadow: 0px 1px 3px rgba(34, 25, 25, 0.2);
  /*border-radius: 4px;*/
  /* Safari 5.1 - 6.0 */
  /* Opera 11.1 - 12.0 */
  /* Firefox 3.6 - 15 */
  background: -webkit-gradient(linear, left top, left bottom, from(#5a6a76), to(#2e3940));
  background: linear-gradient(to bottom, #5a6a76, #2e3940);
}

.button:hover > .contextmenu {
  display: block;
}

.button:hover > * {
  color: #fff;
}
</style>
