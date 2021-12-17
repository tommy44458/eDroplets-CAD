<template>
  <div class="contextmenu-wrap" v-show="status" :style="style">
    <ul class="contextmenu">
      <li @click.stop=""
        v-for="item in menu"
        class="contextmenu__item"
        :key="item.name"
        :id="item.name"
      >
        <div @click.stop="fnHandler(item)" class="button">
          <span>{{ item.name }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'contextmenu',
  props: {
    specialState: {
      type: Boolean,
      default () {
        return false
      }
    },
    axis: {
      type: Object,
      default () {
        return { x: null, y: null }
      }
    }
  },
  data: function () {
    return {
      status: false
      // menu: [
      //     { name: 'select', action: 'select' },
      //     { name: 'copy', action: 'copy' },
      //     { name: 'paste', action: 'paste' },
      //     { name: 'cut', action: 'cut' },
      //     { name: 'delete', action: 'delete' },
      //     { name: 'combine', action: 'combine' },
      //     { name: 'separate', action: 'separate' }
      //   ]
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
    },
    menu () {
      if (this.specialState) {
        return [ { name: 'select', action: 'select' } ]
      }
      return [
          { name: 'select', action: 'select' },
          { name: 'copy', action: 'copy' },
          { name: 'paste', action: 'paste' },
          { name: 'cut', action: 'cut' },
          { name: 'delete', action: 'delete' },
          { name: 'combine', action: 'combine' },
          { name: 'separate', action: 'separate' }
        ]
    }
  },
  methods: {
    resolve (action) {
        switch (action) {
          case 'select':
            this.$emit('clearState')
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
    },
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
