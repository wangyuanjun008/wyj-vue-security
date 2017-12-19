<template>
	<div>
		<section>
			<!--工具条-->
			<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
				<el-form :inline="true" :model="filters">
					<el-form-item>
						<el-input v-model="filters.userName" placeholder="姓名"></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" v-on:click="getRoles">查询</el-button>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="handleAdd">新增</el-button>
					</el-form-item>
					<el-form-item>
						<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
					</el-form-item>					
					<el-form-item>
						<el-button type="danger" @click="operate" :disabled="this.sels.length!=1">操作权限</el-button>
					</el-form-item>				
				</el-form>
			</el-col>

			<!--列表-->
			<el-table :data="roles" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;" height=480>
				<el-table-column type="selection" width="55">
				</el-table-column>
				<el-table-column type="index" width="60">
				</el-table-column>
				<el-table-column prop="roleName" label="角色名称" fit=true sortable>
				</el-table-column>
				<el-table-column prop="roleSign" label="角色标识"fit=true sortable>
				</el-table-column>
				<el-table-column prop="remake" label="描述" fit=true sortable>
				</el-table-column>
				<el-table-column label="操作" width="150" fixed="right">
					<template slot-scope="scope">
						<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
						<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>

			<!--工具条-->
			<el-col :span="24" class="toolbar">
				<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
				</el-pagination>
			</el-col>

			<!--公共界面-->
			<el-dialog title="标题" :visible.sync="commonFormVisible" :close-on-click-modal="false" width="22%">
				<el-form :model="commonForm" label-width="80px" :rules="commonFormRules" ref="commonForm">
					<el-row>
						<el-col>
							<el-form-item label="角色名称" prop="roleName">
								<el-input v-model="commonForm.roleName" auto-complete="off"></el-input>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row>
						<el-col>
							<el-form-item label="角色标识" prop="roleSign">
								<el-input v-model="commonForm.roleSign" auto-complete="off"></el-input>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row>
						<el-col>
							<el-form-item label="描述">
								<el-input v-model="commonForm.remake" auto-complete="off"></el-input>
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
			<el-dialog title="操作权限" :visible="treeVisible" :close-on-click-modal="false" width="22%">
 				<el-form :model="form">
					<ul id="treeDemo" class="ztree" url="/remote/auth/renderTree"></ul>
					<el-input v-model="form.tree" type="hidden" auto-complete="off"></el-input>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click.native="treeVisible = false">取消</el-button>
					<el-button type="primary" @click.native="treeSubmit" :loading="treeLoading">提交</el-button>
				</div>
			</el-dialog>
		</section>
	</div>
</template>

<script>
	import { getRoleListPage, removeRole, addRole,getData,getDataStore } from '../../api/api';
	var ztree;
	export default {
		data() {
			return {
				filters: {
					name: ''
				},
				roles: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列
				commonFormVisible: false,//界面是否显示
				treeVisible: false,//操作权限树是否显示
				commonLoading: false,
				treeLoading : false,
				commonFormRules: {
					roleName: [
						{ required: true, message: '请输入角色名称', trigger: 'blur' }
					],
					roleSign: [
						{ required: true, message: '请输入角色标识', trigger: 'blur' }
					]
				},
				//界面数据重置
				commonForm: {
					roleId: '',
					roleName: '',
					roleSign: '',
					remake: ''
				},
				form :{
					tree:''
				}
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.page = val;
				this.getRoles();
			},
			//获取用户列表
			getRoles() {
				let para = {
					offset: this.page,
					roleName: this.filters.roleName
				};
				this.listLoading = true;
				getRoleListPage(para).then((res) => {
					this.total = res.data.total;
					this.roles = res.data;
					this.listLoading = false;
				});
			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					let para = { ids: row.userId };
					removeRole(para).then((res) => {
						this.listLoading = false;
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getRoles();
					});
				}).catch(() => {
				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.commonFormVisible = true;
				this.commonForm = Object.assign({}, row);
			},
			//显示新增界面
			handleAdd: function () {
				this.commonFormVisible = true;
				this.commonForm = {
					roleId: '',
					roleName: '',
					roleSign: '',
					remake: ''
				};
			},
			//提交
			commonSubmit: function () {
				this.$refs.commonForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.commonLoading = true;
							let para = Object.assign({}, this.commonForm);
							addRole(para).then((res) => {
								this.commonLoading = false;
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['commonForm'].resetFields();
								this.commonFormVisible = false;
								this.getDataGroups();
							});
						});
					}
				});
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			//批量删除
			batchRemove: function () {
				var ids = this.sels.map(item => item.userId).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					let para = { ids: ids };
					removeRole(para).then((res) => {
						this.listLoading = false;
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getRoles();
					});
				}).catch(() => {
				});
			},			//加载树
			getAuthTree : function(){
				var _this = this;
			    //var jsonTree = getDataStore($("#treeDemo").attr("url"));
			    var jsonTree = getDataStore('/remote/auth/renderTree');
		        var setting = {
		            data : {
		                simpleData : {
		                    enable : true,
		                    idKey : "menuId",
		                    pIdKey : "parentId",
		                    rootPId : 0
		                },
		                key : {
		                    url : "xUrl"
		                }
		            },
		            check : {
		                enable : true,
		                chkStyle : "checkbox",
		                chkboxType : {
		                    "Y" : "ps",
		                    "N" : "ps"
		                }
		            }
		        };
            	ztree = $.fn.zTree.init($("#treeDemo"), setting, jsonTree);
            	ztree.checkAllNodes(false);//全部节点取消勾选
            	ztree.expandAll(true);
            	var jsonMenus = getDataStore('remote/role/' + this.sels[0].roleId + '?time=' + new Date().getTime());
	            //勾选角色所拥有的菜单
	            var menuIds = jsonMenus.data.obj.menus;
	            for (var i = 0; i < menuIds.length; i++) {
	                var node = ztree.getNodeByParam("menuId", menuIds[i]);
	                ztree.checkNode(node, true, false);
	            }
			},
			//重新加载树
			reloadTree : function(){
			    $.fn.zTree.destroy("treeDemo");
			    this.getAuthTree();
			},
			//点击操作权限
			operate : function(){
				this.treeVisible = true;
				this.reloadTree();
			},
			//树提交事件
			treeSubmit : function(){
				var _this = this;
		        var id = this.sels[0].roleId;

		        var nodes = ztree.getCheckedNodes(true);
		        if (nodes.length == 0) {
		            return;
		        }
		        var menuList = new Array();
		        for (var i = 0; i < nodes.length; i++) {
		            menuList.push(nodes[i].menuId);
		        }

				this.$confirm('确认提交吗？', '提示', {}).then(() => {
					this.treeLoading = true;
					//let para = {menus : menuList , roleId: id };

				    $.ajax({
				        dataType : 'json',
				        type : 'post',
				        url : '/remote/role/authorize',
				        data : {
                            'menus' : menuList,
                            'roleId' : id
				        },
				        traditional : true,
				        success : function(data) {
							_this.treeLoading = false;
							_this.$message({
								message: '提交成功',
								type: 'success'
							});
							_this.treeVisible = false;
							_this.getRoles();
				        }
				    });					
				}).catch(() => {
				});
			}	
		},
		mounted() {
			this.getRoles();
		}
	}

</script>
