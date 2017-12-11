<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.userName" placeholder="姓名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getUsers">查询</el-button>
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
		<el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;" height=480>
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="userName" label="账号" width="120" sortable>
			</el-table-column>
			<el-table-column prop="password" label="密码" width="120" sortable>
			</el-table-column>
			<el-table-column prop="name" label="姓名" width="120" sortable>
			</el-table-column>
			<el-table-column prop="sex" label="性别" width="120" :formatter="formatSex" sortable>
			</el-table-column>
			<el-table-column prop="phone" label="手机" width="120" sortable>
			</el-table-column>
			<el-table-column prop="email" label="邮箱" width="180" sortable>
			</el-table-column>
			<el-table-column prop="address" label="地址" min-width="180" sortable>
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
						<el-form-item label="帐号" prop="userName">
							<el-input v-model="commonForm.userName" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="密码" prop="password">
							<el-input v-model="commonForm.password" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="姓名" prop="name">
							<el-input v-model="commonForm.name" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>										
				</el-row>
				<el-row :span="24">
					<el-col :span="8">
						<el-form-item label="手机号码">
							<el-input v-model="commonForm.phone" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="邮箱">
							<el-input v-model="commonForm.email" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="性别">
							<el-select v-model="commonForm.sex" clearable placeholder="请选择">
								<el-option v-for="item in sexItems" :key="item.id" :label="item.text" :value="item.id" ></el-option>
							</el-select> 
						</el-form-item>
					</el-col>										
				</el-row>
				<el-row :span="24">
					<el-col :span="8">
						<el-form-item label="地址">
							<el-input v-model="commonForm.address" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="可选角色">
							<el-select v-model="commonForm.roles" multiple placeholder="请选择">
								<el-option v-for="item in rolesItems" :key="item.id" :label="item.text" :value="item.id" ></el-option>
							</el-select> 
						</el-form-item>
					</el-col>
				</el-row>
				<el-input v-model="commonForm.userId" type="hidden" auto-complete="off"></el-input>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="commonFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="commonSubmit" :loading="commonLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import util from '../../util/js/util'
	import { getUserListPage, removeUser, addUser,editUser,getData,getDataStore } from '../../api/api';
	export default {
		data() {
			return {
				filters: {
					name: ''
				},
				users: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列
				commonFormVisible: false,//界面是否显示
				commonLoading: false,
				commonFormRules: {
					userName: [
						{ required: true, message: '请输入帐号', trigger: 'blur' }
					],
					password: [
						{ required: true, message: '请输入密码', trigger: 'blur' }
					],
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					]
				},
				//界面数据重置
				commonForm: {
					userId: '',
					userName: '',
					password: '',
					name: '',
					sex: '',
					phone: '',
					email: '',
					address: '',
					roles: ''
				},
				sexItems : getDataStore('/remote/dataDict/getData?groupCode='+'sex'),
				rolesItems : getDataStore('/remote/dataDict/getData?groupCode='+'yesOrNo')
			}
		},
		methods: {
			//性别显示转换
			formatSex: function (row, column) {
				return row.sex == 1 ? '男' : row.sex == 2 ? '女' : '未知';
			},
			handleCurrentChange(val) {
				this.page = val;
				this.getUsers();
			},
			//获取用户列表
			getUsers() {
				let para = {
					offset: this.page,
					userName: this.filters.userName
				};
				this.listLoading = true;
				getUserListPage(para).then((res) => {
					this.total = res.data.total;
					this.users = res.data;
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
					removeUser(para).then((res) => {
						this.listLoading = false;
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getUsers();
					});
				}).catch(() => {
				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.commonFormVisible = true;
				let data = Object.assign({}, row);
				editUser(data.userId).then((res) => {
					this.$refs['commonForm'].resetFields();
					this.commonForm = res.data.data.obj;
				});
			},
			//显示新增界面
			handleAdd: function () {
				this.commonFormVisible = true;
				this.commonForm = {
					userId: '',
					userName:'',
					password:'',
					name:'',
					phone:'',
					email: '',
					sex: '',
					address: '',
					roles: ''
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

							//将表单数据转换成以'&'分隔的数据
							var strFormData='';
							for(var i in para){
								if(Object.prototype.toString.call(para[i]) === '[object Array]'){
									for(var j in para[i]){
										strFormData+=i+'='+para[i][j]+'&'
									}
								}else{
									strFormData+= i+'='+para[i]+'&'
								}							
							}
							strFormData = strFormData.substring(0,strFormData.length-1);

						    $.ajax({
						        dataType : 'json',
						        type : 'post',
						        url : '/remote/user/add',
						        data : strFormData,
						        success : function(data) {
									_this.commonLoading = false;
									_this.$message({
										message: '提交成功',
										type: 'success'
									});
									_this.$refs['commonForm'].resetFields();
									_this.commonFormVisible = false;
									_this.getUsers();
						        }
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
					removeUser(para).then((res) => {
						this.listLoading = false;
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getUsers();
					});
				}).catch(() => {
				});
			}
		},
		mounted() {
			this.getUsers();
		}
	}
</script>
