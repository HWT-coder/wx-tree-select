# wx-tree-select
# 微信小程序的树形下拉复选框
# 点击选中自动选中并展开子节点
# 点击取消当前节点并自动取消其子节点
# 根据当前选中节点自动更改父节点状态，分为all、none、half
# collapse为true是折叠态,为false是展开态
# checked 1选中 0取消 -1选中但未完全选中
# 组件之间是通过事件通信传递状态，并替换旧的状态实现状态的保存
# change事件提供给调用页面实时tree
