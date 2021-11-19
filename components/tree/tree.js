Component({
  properties: {
    treeListIndex: {
      // 默认为0，当前循环的第几层，用于tree样式展示
      type: Number,
      value: 0
    },
    treeList: {
      type: Array,
      value: []
    }
  },
  options: {
    addGlobalClass: true,
  },
  externalClasses: ['item-class'],
  data: {
    treeList: []
  },
  lifetimes: {
    attached() {
      this.setData({
        treeList: this.__initSourceData(this.properties.treeList)
      })
    }
  },
  methods: {
    /**
     * @method 初始化源数据
     * @param {Array} nodes 节点
     * @todo checked初始状态0，collapse初始状态true
     * @property {Number} checked 1选中，0未选中，-1选中了但又没完全选中 
     */
    __initSourceData(nodes) {
      nodes.forEach(element => {
        element.checked = 0
        element.collapse = true
        if (element.children && element.children.length > 0) element.children = this.__initSourceData(element.children)
      })
      return nodes
    },
    /**
     * @method 点击折叠或展开
     * @description 原生写法是不能接受自定义参数在方法的，只能写在data-去接收
     */
    toggleCollapse(e) {
      let currentTap = e.currentTarget.dataset.item
      currentTap.collapse = !currentTap.collapse
      // 修正整个treeList,这个其实是最顶层的情况
      this.data.treeList = this.__replaceItem(currentTap, this.data.treeList)
      this.setData({
        treeList: this.data.treeList
      })
      this.triggerEvent('toggle', currentTap)
    },
    /**
     * @method 点击折叠或展开
     * @descriptions 利用组件通信，把底层的数据一层层往上传，替换掉旧的，就实现状态的保存了
     */
    handleToggle(e) {
      let parent = e.currentTarget.dataset.parent
      const currentTap = e.detail
      // 修正它的父节点
      parent.children = this.__replaceItem(currentTap, parent.children)
      // 修正整个treeList
      this.data.treeList = this.__replaceItem(parent, this.data.treeList)
      this.setData({
        treeList: this.data.treeList
      })
      this.triggerEvent('toggle', currentTap)
    },
    /**
     * @method 替换元素方法
     * @param {Obejct} newItem 新的数据 
     * @param {Array} nodes 节点数组 
     */
    __replaceItem(newItem, nodes) {
      if (!nodes || nodes.length <= 0) return
      for (let i = 0, j = nodes.length; i < j; i++) {
        if (newItem.id === nodes[i].id) {
          nodes[i] = newItem
          break
        } else {
          if (nodes[i].children && nodes[i].children.length > 0) {
            nodes[i].children = this.__replaceItem(newItem, nodes[i].children)
          }
        }
      }
      return nodes
    },
    /**
     * @method 点击选中或取消
     * @description 选中的话自动选中并展开其子节点，取消的话自动自动取消其子节点
     */
    __checkboxTreeItem(e) {
      let currentTap = e.currentTarget.dataset.item
      switch (currentTap.checked) {
        case 0:
          currentTap.checked = 1
          currentTap.collapse = false
          currentTap.children = this.__allChoice(currentTap.children)
          break;
        case 1:
          currentTap.checked = 0
          currentTap.children = this.__cancelAllChoice(currentTap.children)
          break;
        default:
          currentTap.checked = 1
          currentTap.collapse = false
          currentTap.children = this.__allChoice(currentTap.children)
          break;
      }
      this.data.treeList = this.__replaceItem(currentTap, this.data.treeList)
      this.setData({
        treeList: this.data.treeList
      })
      this.triggerEvent('treeTap', currentTap)
      // 下面这个是给组件调用页面传递的
      this.triggerEvent('change', currentTap)
    },
    /**
     * @method 利用组件通信，把底层的数据一层层往上传，替换掉旧的，就实现状态的保存了
     * @description 一层层给往上设置状态
     */
    handleTreeTap(e) {
      let parent = e.currentTarget.dataset.parent
      const currentTap = e.detail
      // 修正它的父节点
      parent.children = this.__replaceItem(currentTap, parent.children)
      const { half, all, none } = this.getChildState(parent.children)
      // console.log(`half:${half},all:${all},none:${none}`)
      if (half) parent.checked = -1
      if (all) parent.checked = 1
      if (none) parent.checked = 0
      // 修正整个treeList
      this.data.treeList = this.__replaceItem(parent, this.data.treeList)
      this.setData({
        treeList: this.data.treeList
      })
      this.triggerEvent('treeTap', parent)
      // 下面这个是给组件调用页面传递的
      this.triggerEvent('change', parent)
    },
    __allChoice(nodes) {
      if (!nodes || nodes.length <= 0) return
      for (let i = 0, j = nodes.length; i < j; i++) {
        nodes[i].checked = 1
        nodes[i].collapse = false
        if (nodes[i].children && nodes[i].children.length > 0) {
          nodes[i].children = this.__allChoice(nodes[i].children)
        }
      }
      return nodes
    },
    __cancelAllChoice(nodes) {
      if (!nodes || nodes.length <= 0) return
      for (let i = 0, j = nodes.length; i < j; i++) {
        nodes[i].checked = 0
        if (nodes[i].children && nodes[i].children.length > 0) {
          nodes[i].children = this.__cancelAllChoice(nodes[i].children)
        }
      }
      return nodes
    },
    /**
     * @method 获取子节点的状态
     * @param {Array} node 节点数组
     */
    getChildState(node) {
      let all = true;
      let none = true;
      for (let i = 0, j = node.length; i < j; i++) {
        const n = node[i];
        if (n.checked === 1 || n.checked === -1) {
          none = none && false;
        }
        if (n.checked === 0 || n.checked === -1) {
          all = all && false
        }
      }
      return { all, none, half: !all && !none };
    }
  }
})
