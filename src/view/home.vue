<template>
	<div>
		<el-row class="container">
			<el-col :span="24" class="header">
				<el-col :span="20" class="logo" :class="collapsed?'logo-collapse-width':'logo-width'">
					{{collapsed?'':sysName}}
				</el-col>
				<el-col :span="4" class="userinfo">
					<el-dropdown trigger="hover">
						<span class="el-dropdown-link userinfo-inner"><img src="../assets/user.jpg" /> {{sysUserName}}</span>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item @click.native="personInfo">修改密码</el-dropdown-item>
							<el-dropdown-item>设置</el-dropdown-item>
							<el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
				</el-col>
			</el-col>
			<el-col :span="24" class="main">
				<aside :class="collapsed?'menu-collapsed':'menu-expanded'">
					<el-menu :default-active="$route.path" class="el-menu-vertical-demo" @open="handleopen" @close="handleclose"
						 unique-opened router v-show="!collapsed">
						<template v-for="(item,index) in menus">
							<el-submenu :index="index+''"  v-if="item.type==0">
								<template slot="title">{{item.name}}</template>
								<el-menu-item v-for="child in item.list" :index="child.url" :key="child.url" v-if="item.list != null">{{child.name}}</el-menu-item>
							</el-submenu>
							<el-menu-item v-if="item.type==1" :index="item.url">{{item.name}}</el-menu-item>
						</template>
					</el-menu>				
				</aside>
				<section class="content-container">
					<div class="grid-content bg-purple-light">
						<el-col :span="24" class="breadcrumb-container">
							<strong class="title">{{$route.name}}</strong>
							<el-breadcrumb separator="/" class="breadcrumb-inner">
								<el-breadcrumb-item v-for="item in $route.matched" :key="item.path">
									{{ item.name }}
								</el-breadcrumb-item>
							</el-breadcrumb>
						</el-col>
						<el-col :span="24" class="content-wrapper">
							<transition name="fade" mode="out-in">
								<router-view></router-view>
							</transition>
						</el-col>
					</div>
				</section>
			</el-col>
		</el-row>
		<!--公共界面-->
		<el-dialog title="修改密码" :visible.sync="commonFormVisible" :close-on-click-modal="false" width="22%">
			<el-form :model="commonForm" label-width="110px" :rules="commonFormRules" ref="commonForm">
				<el-row>
					<el-col>
						<el-form-item label="原密码" prop="oldPassword">
							<el-input v-model="commonForm.oldPassword" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col>
						<el-form-item label="新密码" prop="newPassword">
							<el-input v-model="commonForm.newPassword" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col>
						<el-form-item label="再输入新密码" prop="repeatNewPassword">
							<el-input v-model="commonForm.repeatNewPassword" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>										
				</el-row>			
				<el-input v-model="commonForm.roleId" type="hidden" auto-complete="off"></el-input>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="commonFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="commonSubmit" :loading="commonLoading">提交</el-button>
			</div>
		</el-dialog>	
	</div>
</template>

<script>
import {getDataStore,updatePassword } from '../api/api';
	export default {
		data() {
			return {
				sysName:'权限管理系统',
				collapsed:false,
				sysUserName: '',
				sysUserAvatar: '../assets/user.jpg',
				commonFormRules: {
					oldPassword: [
						{ required: true, message: '请输入原密码', trigger: 'blur' }
					],
					newPassword: [
						{ required: true, message: '请输入新密码', trigger: 'blur' }
					],
					repeatNewPassword: [
						{ required: true, message: '请输入再输入新密码', trigger: 'blur' }
					]
				},
				//界面数据重置
				commonForm: {
					oldPassword: '',
					newPassword: '',
					repeatNewPassword: ''
				},
				commonFormVisible: false,//界面是否显示
				commonLoading: false,
				menus:getDataStore('/remote/index').data.menus,
			}
		},
		methods: {
			onSubmit() {
				console.log('submit!');
			},
			handleopen() {
				//console.log('handleopen');
			},
			handleclose() {
				//console.log('handleclose');
			},
			//退出登录
			logout: function () {
				var _this = this;
				this.$confirm('确认退出吗?', '提示', {
					//type: 'warning'
				}).then(() => {
					sessionStorage.removeItem('user');
					_this.$router.push('/login');
				}).catch(() => {
				});
			},
			//折叠导航栏
			collapse:function(){
				this.collapsed=!this.collapsed;
				console.log(window.parent.perms);
			},
			showMenu(i,status){
				this.$refs.menuCollapsed.getElementsByClassName('submenu-hook-'+i)[0].style.display=status?'block':'none';
			},
			//当前登陆人的操作权限
			getPermList : function(){
			    $.ajax({
			        dataType : 'json',
			        url : '/remote/user/perms',
			        async : false,
			        success : function(data) {
			        	window.perms=data.data.perms;
			        }
			    });				
			},
			personInfo : function(){
				this.commonFormVisible = true;
				this.commonForm = {
					oldPassword: '',
					newPassword: '',
					repeatNewPassword: ''
				};				
			},
			//提交
			commonSubmit: function () {
				this.$refs.commonForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							if(this.commonForm.newPassword != this.commonForm.repeatNewPassword){
				                this.$message({
				                    message: '新密码输入不正确,请重新输入!',
				                    type: 'error'
				                });
				                return;
							}
							this.commonLoading = true;
							let para = Object.assign({}, this.commonForm);
							updatePassword(para).then(data => {
								this.commonLoading = false;

					            let { errorMsg, success} = data;
					            if (success == true) {
									this.$message({
										message: '提交成功',
										type: 'success'
									});              	
					            } else {
					                this.$message({
					                    message: errorMsg,
					                    type: 'error'
					                });
					            }
								this.$refs['commonForm'].resetFields();
							});
						});
					}
				});
			}			
		},
		mounted() {
			var user = sessionStorage.getItem('user');
			if (user) {
				user = JSON.parse(user);
				this.sysUserName = user.name || '';
				//this.sysUserAvatar = user.avatar || '';
			}
			this.getPermList();
		}
	}
</script>

<style scoped lang="scss">
	.container {
		position: absolute;
		top: 0px;
		bottom: 0px;
		width: 100%;
		.header {
			height: 60px;
			line-height: 60px;
			background: #20a0ff;
			color:#fff;
			.userinfo {
				text-align: right;
				padding-right: 35px;
				float: right;
				.userinfo-inner {
					cursor: pointer;
					color:#fff;
					img {
						width: 40px;
						height: 40px;
						border-radius: 20px;
						margin: 10px 0px 10px 10px;
						float: right;
					}
				}
			}			
			.logo {
				//width:230px;
				height:60px;
				font-size: 22px;
				padding-left:20px;
				padding-right:20px;
				border-color: rgba(238,241,146,0.3);
				border-right-width: 1px;
				border-right-style: solid;
				img {
					width: 40px;
					float: left;
					margin: 10px 10px 10px 18px;
				}
				.txt {
					color:#fff;
				}
			}
			.logo-width{
				width:230px;
			}
			.logo-collapse-width{
				width:60px
			}
			.tools{
				padding: 0px 23px;
				width:14px;
				height: 60px;
				line-height: 60px;
				cursor: pointer;
			}
		}
		.main {
			display: flex;
			// background: #324057;
			position: absolute;
			top: 60px;
			bottom: 0px;
			overflow: hidden;
			aside {
				flex:0 0 230px;
				width: 230px;
				// position: absolute;
				// top: 0px;
				// bottom: 0px;
				.el-menu{
					height: 100%;
				}
				.collapsed{
					width:60px;
					.item{
						position: relative;
					}
					.submenu{
						position:absolute;
						top:0px;
						left:60px;
						z-index:99999;
						height:auto;
						display:none;
					}
				}
			}
			.menu-collapsed{
				flex:0 0 60px;
				width: 60px;
			}
			.menu-expanded{
				flex:0 0 230px;
				width: 230px;
			}
			.content-container {
				// background: #f1f2f7;
				flex:1;
				// position: absolute;
				// right: 0px;
				// top: 0px;
				// bottom: 0px;
				// left: 230px;
				overflow-y: scroll;
				padding: 20px;
				.breadcrumb-container {
					//margin-bottom: 15px;
					.title {
						width: 200px;
						float: left;
						color: #475669;
					}
					.breadcrumb-inner {
						float: right;
					}
				}
				.content-wrapper {
					background-color: #fff;
					box-sizing: border-box;
				}
			}
		}

	}
</style>
