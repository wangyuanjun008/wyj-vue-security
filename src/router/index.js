import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    component: resolve => require(['../view/login.vue'], resolve),
    hidden: true
  },{
    path: '/homePage',
    name : '首页',
    component: resolve => require(['../view/home.vue'], resolve),
    leaf: true,//只有一个节点
    children: [{
        path: '/homePage',
        component: resolve => require(['../view/homePage/homePage.vue'], resolve),
        name : '首页'
      }
    ]
  }, {
    path: '/user',
    component: resolve => require(['../view/home.vue'], resolve),
    name : '角色用户管理',
    children: [{
        path: '/user',
        component: resolve => require(['../view/user/user.vue'], resolve),
        name : '用户管理'
      },{
        path: '/role',
        component: resolve => require(['../view/user/role.vue'], resolve),
        name : '角色管理'
      }
    ]
  }, {
    path: '/auth',
    component: resolve => require(['../view/home.vue'], resolve),
    name : '权限资源管理',
    children: [{
        path: '/menu',
        component: resolve => require(['../view/anth/menu.vue'], resolve),
        name : '菜单管理'
      },{
        path: '/auth',
        component: resolve => require(['../view/anth/auth.vue'], resolve),
        name : '权限管理'
      }
    ]
  }, {
    path: '/data',
    component: resolve => require(['../view/home.vue'], resolve),
    name : '数据字典',
    children: [{
        path: '/dataGroup',
        component: resolve => require(['../view/data/dataGroup.vue'], resolve),
        name : '数据分组'
      },{
        path: '/dataDict',
        component: resolve => require(['../view/data/dataDict.vue'], resolve),
        name : '数据字典'
      },{
        path: '/log',
        component: resolve => require(['../view/log/log.vue'], resolve),
        name : '日志记录'
      }
    ]
  }]
})
