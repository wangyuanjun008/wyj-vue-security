<template>
	<div>
		<el-row>
			<el-col :span="4">
					<ul id="treeDemo" class="ztree" url="/remote/auth/renderTree"></ul>
			</el-col>
			<el-col :span="20">
				<section>
					<!--工具条-->
					<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
						<el-form :inline="true" :model="filters">
							<el-form-item>
								<el-input v-model="filters.name" placeholder="名称"></el-input>
								<el-input type="hidden" v-model="filters.parentId"></el-input>
							</el-form-item>
							<el-form-item>
								<el-button type="primary" v-on:click="getAuths">查询</el-button>
							</el-form-item>
							<el-form-item>
								<el-button type="primary" @click="handleAdd">新增</el-button>
							</el-form-item>
							<el-form-item>
								<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
							</el-form-item>
						</el-form>
					</el-col>

					<!--列表-->
					<el-table :data="auths" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;" height=480>
						<el-table-column type="selection" fit=true>
						</el-table-column>
						<el-table-column type="index" fit=true>
						</el-table-column>
						<el-table-column prop="name" label="权限名称" fit=true sortable>
						</el-table-column>
						<el-table-column prop="perms" label="授权标识" fit=true sortable>
						</el-table-column>
						<el-table-column prop="orderNum" label="排序" fit=true sortable>
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
					<el-dialog title="标题" :visible.sync="commonFormVisible" :close-on-click-modal="false">
						<el-form :model="commonForm" label-width="80px" :rules="commonFormRules" ref="commonForm">
							<el-row :span="24">
								<el-col :span="8">
									<el-form-item label="名称" prop="name">
										<el-input v-model="commonForm.name" auto-complete="off"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="菜单url" prop="url">
										<el-input v-model="commonForm.url" auto-complete="off"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="8">
									<el-form-item label="授权标识" prop="perms">
										<el-input v-model="commonForm.perms" auto-complete="off"></el-input>
									</el-form-item>
								</el-col>										
							</el-row>				
							<el-row :span="24">
								<el-col :span="8">
									<el-form-item label="排序">
										<el-input v-model="commonForm.orderNum" auto-complete="off"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
							<el-input v-model="commonForm.menuId" type="hidden" auto-complete="off"></el-input>
							<el-input v-model="commonForm.parentId" type="hidden" auto-complete="off"></el-input>
							<el-input v-model="commonForm.type" type="hidden" auto-complete="off"></el-input>
						</el-form>
						<div slot="footer" class="dialog-footer">
							<el-button @click.native="commonFormVisible = false">取消</el-button>
							<el-button type="primary" @click.native="commonSubmit" :loading="commonLoading">提交</el-button>
						</div>
					</el-dialog>		
				</section>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	import { getAuthListPage,addAuth,removeAuth,getData,getDataStore} from '../../api/api';
	export default {
		data() {
			return {
				filters: {
					parentId: '',
					name : ''
				},
				auths: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列
				commonFormVisible: false,//新增界面是否显示
				commonLoading: false,
				commonFormRules: {
					name: [
						{ required: true, message: '请输入名称', trigger: 'blur' }
					],
					perms: [
						{ required: true, message: '请输入授权标识', trigger: 'blur' }
					]
				},
				//新增界面数据
				commonForm: {
					menuId: '',
					parentId: '',
					name: '',
					url: '',
					perms: '',
					orderNum: ''
				},
				typeItems : getDataStore('/remote/dataDict/getData?groupCode='+'menuType'),
				isUseItems : getDataStore('/remote/dataDict/getData?groupCode='+'yesOrNo')
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.page = val;
				this.getAuths();
			},
			//获取列表
			getAuths() {
				let para = {
					offset: this.page,
					parentId: this.filters.parentId
				};
				this.listLoading = true;
				getAuthListPage(para).then((res) => {
					this.total = res.data.total;
					this.auths = res.data;
					this.listLoading = false;
				});
			},
			//删除
			handleDel: function (index, row) {
				let a =this.items;
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					let para = { ids: row.menuId };
					removeAuth(para).then((res) => {
						this.listLoading = false;
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.reloadTree();
						this.getAuths();
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
					menuId: '',
					parentId: '',
					name: '',
					url: '',
					perms: '',
					orderNum: ''
				};
			},
			//提交
			commonSubmit: function () {
				var _this = this;
				this.$refs.commonForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.commonLoading = true;
							let para = Object.assign({}, this.commonForm);
							//para.createTime = (!para.createTime || para.createTime == '') ? '' : util.formatDate.format(new Date(para.createTime), 'yyyy-MM-dd');
							delete para.createTime;
							delete para.modifyTime;
							para.parentId = _this.filters.parentId;
							addAuth(para).then((res) => {
								this.commonLoading = false;
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['commonForm'].resetFields();
								this.commonFormVisible = false;
								this.reloadTree();
								this.getAuths();
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
				var ids = this.sels.map(item => item.menuId).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					let para = { ids: ids };
					removeAuth(para).then((res) => {
						this.listLoading = false;
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.reloadTree();
						this.getAuths();
					});
				}).catch(() => {
				});
			},			//加载树
			getDataGroupTree : function(){
				var _this = this;
			    var jsonTree = getDataStore($("#treeDemo").attr("url"));
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
		            callback : {
		                onClick : function(event, treeId, treeNode, clickFlag){
		                	_this.filters.parentId=treeNode.menuId;
		                	_this.getAuths();
		                }
		            }
		        };
            	$.fn.zTree.init($("#treeDemo"), setting, jsonTree);
			},
			//重新加载树
			reloadTree : function(){
			    $.fn.zTree.destroy("treeDemo");
			    this.getDataGroupTree();
			}
		},
		mounted() {
			this.getAuths();
			this.getDataGroupTree();
		}
	}
</script>
