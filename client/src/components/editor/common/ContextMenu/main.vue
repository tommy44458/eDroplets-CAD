<template>
  <div class="contextmenu-wrap" v-show="status" :style="style">
    <div @click="$emit('close')"></div>
    <ContextMenu :icon="icon" :menu="menu" :resolve="resolve"></ContextMenu>
  </div>
</template>

<script>
import ContextMenu from './ContextMenu'
export default {
  name: 'contextmenu-wrap',
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
      default: function () {}
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
      // 判断menu距离浏览器可视窗口底部距离,以免距离底部太近的时候，会导致menu被遮挡
      let menuHeight = this.menu.length * 32 // 不能用scrollHeight,获取到的menu是上一次的menu宽高
      let menuWidth = 150 // 不能用scrollWidth,同理
      return {
        left:
          (document.body.clientWidth < x + menuWidth ? x - menuWidth : x) +
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
  beforeDestroy () {
    document.body.removeChild(this.$el)
  },
  mounted () {
    // 挂载后才开始计算左右，隐藏挂载后显示不会闪一下
    this.$nextTick(function () {
      this.status = true
    })
  },
  components: {
    ContextMenu
  }
}
</script>

<style>
.contextmenu-wrap {
  display: block;
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  border-radius: 5px;
  /*overflow: hidden;*/
  /*border: 1px solid #ccc;*/
}

.contextmenu-wrap .contextmenu {
  margin: 0;
  -webkit-box-shadow: 0 0 5px #ccc;
          box-shadow: 0 0 5px #ccc;
  border: 1px solid #ccc;
}

.contextmenu-wrap .contextmenu__item {
  width: 155px;
  height: 30px;
  line-height: 30px;
  border-radius: 4px;
  background: #fff;
  text-decoration: none;
  list-style: none;
  position: relative;
}

.contextmenu-wrap .contextmenu__item .button {
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
  padding: 0 5px;
}

.contextmenu-wrap .contextmenu__item .button > * {
  color: #333;
}

.contextmenu-wrap .contextmenu__item .button span {
  -webkit-box-flex: 1;
      -ms-flex: 1;
          flex: 1;
  text-align: left;
  margin-left: 5px;
}

.contextmenu-wrap .contextmenu__item .button i {
  text-align: center;
}

.contextmenu-wrap .contextmenu__item .button .contextmenu {
  position: absolute;
  right: calc(-100% - 2px);
  top: -1px;
  display: none;
}

.contextmenu-wrap .contextmenu__item .button:hover {
  -webkit-box-shadow: 0px 1px 3px rgba(34, 25, 25, 0.2);
          box-shadow: 0px 1px 3px rgba(34, 25, 25, 0.2);
  /*border-radius: 4px;*/
  /* Safari 5.1 - 6.0 */
  /* Opera 11.1 - 12.0 */
  /* Firefox 3.6 - 15 */
  background: -webkit-gradient(linear, left top, left bottom, from(#5a6a76), to(#2e3940));
  background: linear-gradient(to bottom, #5a6a76, #2e3940);
}

.contextmenu-wrap .contextmenu__item .button:hover > .contextmenu {
  display: block;
}

.contextmenu-wrap .contextmenu__item .button:hover > * {
  color: #fff;
}
/*# sourceMappingURL=style.css.map */
</style>
