<template>
  <div class="contextmenu-wrap" v-show="status" :style="style">
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
            console.log('emit delete')
            this.$emit('delete')
            break
          case 'combine':
            break
          case 'separate':
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
      // 判断menu距离浏览器可视窗口底部距离,以免距离底部太近的时候，会导致menu被遮挡
      let menuHeight = this.menu.length * 32 // 不能用scrollHeight,获取到的menu是上一次的menu宽高
      let menuWidth = this.menu.width// 不能用scrollWidth,同理
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
    ContextMenu
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
</style>
