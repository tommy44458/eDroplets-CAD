<template>
  <ul class="contextmenu">
    <li
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
</template>

<script>
export default {
  name: 'context-menu',
  props: {
    // customEvent: {
    //   type: Object
    // },
    icon: {
      type: Boolean,
      default: true
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
      default: function () {}
    },
    reject: { // 不点击按钮点击其他地方关闭时执行的方法 .catch(e => {})
      type: Function,
      default: function () {}
    }
  },
  data () {
    return {
      status: false
    }
  },
  methods: {
    fnHandler (item) {
      if (item.children && item.children.length > 0) {
        return false
      }
      this.status = false
      // if (item.fn) item.fn(this.customEvent)
      this.resolve(item.action)
    }
  },
  // beforeDestroy () {
  //   document.body.removeChild(this.$el)
  // },
  mounted () {
    // 挂载后才开始计算左右，隐藏挂载后显示不会闪一下
    this.$nextTick(function () {
      this.status = true
    })
  },
  components: {
  }
}
</script>

<style scoped>
.contextmenu {
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