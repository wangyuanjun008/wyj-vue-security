<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.groupCode" placeholder="分组编码"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getDataGroups">查询</el-button>
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
		<el-table :data="dataGroups" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;" height=480>
			<el-table-column type="selection" fit=true>
			</el-table-column>
			<el-table-column type="index" fit=true>
			</el-table-column>
			<el-table-column prop="groupCode" label="分组编码" fit=true sortable>
			</el-table-column>
			<el-table-column prop="groupName" label="分组名称"fit=true sortable>
			</el-table-column>
			<el-table-column prop="remark" label="描述" fit=true sortable>
			</el-table-column>
			<el-table-column prop="status" label="使用状态" fit=true :formatter="formatSex" sortable>
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
			<!-- <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button> -->
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" :visible.sync="editFormVisible" :close-on-click-modal="false" width="22%">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-row>
					<el-col>
						<el-form-item label="分组编码" prop="groupCode">
							<el-input v-model="editForm.groupCode" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col>
						<el-form-item label="分组名称" prop="groupName">
							<el-input v-model="editForm.groupName" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col>
						<el-form-item label="描述">
							<el-input v-model="editForm.remark" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>										
				</el-row>
				<el-row>
					<el-col>
						<el-form-item label="使用状态">
							<el-select v-model="editForm.status" clearable placeholder="请选择">
								<el-option label="是" value="1"></el-option>
								<el-option label="否" value="0"></el-option>
							</el-select> 
						</el-form-item>
					</el-col>										
				</el-row>
				<el-input v-model="editForm.groupId" type="hidden" auto-complete="off"></el-input>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false" width="22%">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-row>
					<el-col>
						<el-form-item label="分组编码" prop="groupCode">
							<el-input v-model="addForm.groupCode" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col>
						<el-form-item label="分组名称" prop="groupName">
							<el-input v-model="addForm.groupName" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col>
						<el-form-item label="描述">
							<el-input v-model="addForm.remark" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>										
				</el-row>
				<el-row>
					<el-col>
						<el-form-item label="使用状态">
							<el-select v-model="addForm.status" clearable placeholder="请选择">
								<el-option label="是" value="1"></el-option>
								<el-option label="否" value="0"></el-option>
							</el-select> 
						</el-form-item>
					</el-col>										
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import util from '../../util/js/util'
	import { getDataGroupListPage,addDataGroup,editDataGroup,removeDataGroup} from '../../api/api';
	export default {
		data() {
			return {
				filters: {
					groupCode: ''
				},
				dataGroups: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列
				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
					groupCode: [
						{ required: true, message: '请输入分组编码', trigger: 'blur' }
					],
					groupName: [
						{ required: true, message: '请输入分组名称', trigger: 'blur' }
					]
				},
				//编辑界面数据
				editForm: {
					id: 0,
					groupCode: '',
					groupName: '',
					remark: '',
					status: ''
				},
				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					groupCode: [
						{ required: true, message: '请输入分组编码', trigger: 'blur' }
					],
					groupName: [
						{ required: true, message: '请输入分组名称', trigger: 'blur' }
					]
				},
				//新增界面数据
				addForm: {
					groupCode: '',
					groupName: '',
					remark: '',
					status: ''
				}
			}
		},
		methods: {
			//性别显示转换
			formatSex: function (row, column) {
				return row.sex == 1 ? '男' : row.sex == 2 ? '女' : '未知';
			},
			handleCurrentChange(val) {
				this.page = val;
				this.getDataGroups();
			},
			//获取用户列表
			getDataGroups() {
				let para = {
					page: this.page,
					name: this.filters.name
				};
				this.listLoading = true;
				getDataGroupListPage(para).then((res) => {
					this.total = res.data.total;
					this.dataGroups = res.data;
					this.listLoading = false;
				});
			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { id: row.id };
					removeUser(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getDataGroups();
					});
				}).catch(() => {
				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
			},
			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
					groupCode: '',
					groupName: '',
					remark: '',
					status: ''
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.editForm);
							para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
							editUser(para).then((res) => {
								this.editLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['editForm'].resetFields();
								this.editFormVisible = false;
								this.getDataGroups();
							});
						});
					}
				});
			},
			//新增
			addSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true;
							let para = Object.assign({}, this.addForm);
							addDataGroup(para).then((res) => {
								this.addLoading = false;
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['addForm'].resetFields();
								this.addFormVisible = false;
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
				var ids = this.sels.map(item => item.id).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { ids: ids };
					batchRemoveUser(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getDataGroups();
					});
				}).catch(() => {
				});
			}
		},
		mounted() {
			this.getDataGroups();
		}
	}
</script>
