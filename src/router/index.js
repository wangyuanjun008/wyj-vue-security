import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    component: resolve => require(['../view/login.vue'], resolve),
    hidden: true
  }, {
    path: '/home',
    component: resolve => require(['../view/home.vue'], resolve),
    name : '角色用户管理',
    children: [{
        path: '/user',
        component: resolve => require(['../view/user/user.vue'], resolve),
        name : '用户管理'
      }
    ]
  }]
})
