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
				<el-form-item v-if="hasPermission('dataGroup:save')">
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
				<el-form-item v-if="hasPermission('dataGroup:remove')">
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
			<el-table-column prop="status" label="使用状态" fit=true :formatter="formatStatus" sortable>
			</el-table-column>
			<el-table-column label="操作" width="150" fixed="right">
				<template slot-scope="scope">
					<el-button v-if="hasPermission('dataGroup:edit')" size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button v-if="hasPermission('dataGroup:remove')" type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
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
						<el-form-item label="分组编码" prop="groupCode">
							<el-input v-model="commonForm.groupCode" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col>
						<el-form-item label="分组名称" prop="groupName">
							<el-input v-model="commonForm.groupName" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col>
						<el-form-item label="描述">
							<el-input v-model="commonForm.remark" auto-complete="off"></el-input>
						</el-form-item>
					</el-col>										
				</el-row>
				<el-row>
					<el-col>
						<el-form-item label="使用状态">
							<el-select v-model="commonForm.status" clearable placeholder="请选择">
								<el-option v-for="item in items" :key="item.id" :label="item.text" :value="item.id" ></el-option>
							</el-select> 
						</el-form-item>
					</el-col>										
				</el-row>
				<el-input v-model="commonForm.groupId" type="hidden" auto-complete="off"></el-input>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="commonFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="commonSubmit" :loading="commonLoading">提交</el-button>
			</div>
		</el-dialog>		
	</section>
</template>

<script>
	import common from '../../util/js/common.js';
	import { getDataGroupListPage,addDataGroup,removeDataGroup,getData} from '../../api/api';
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
				commonFormVisible: false,//新增界面是否显示
				commonLoading: false,
				commonFormRules: {
					groupCode: [
						{ required: true, message: '请输入分组编码', trigger: 'blur' }
					],
					groupName: [
						{ required: true, message: '请输入分组名称', trigger: 'blur' }
					]
				},
				//新增界面数据
				commonForm: {
					groupId: '',
					groupCode: '',
					groupName: '',
					remark: '',
					status: ''
				},
				items : []
			}
		},
		methods: {
			getDatas(){
				getData({'groupCode' : 'yesOrNo'}).then((res) => {
					this.items = res.data;
				})
			},
			formatStatus: function (row, column) {
				return row.status == 1 ? '是' : row.status == 0 ? '否' : '未知';
			},
			handleCurrentChange(val) {
				this.page = val;
				this.getDataGroups();
			},
			//获取列表
			getDataGroups() {
				let para = {
					offset: this.page,
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
				let a =this.items;
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					let para = { ids: row.groupId };
					removeDataGroup(para).then((res) => {
						this.listLoading = false;
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
				this.commonFormVisible = true;
				this.commonForm = Object.assign({}, row);
			},
			//显示新增界面
			handleAdd: function () {
				this.commonFormVisible = true;
				this.commonForm = {
					groupId: '',
					groupCode: '',
					groupName: '',
					remark: '',
					status: ''
				};
			},
			//提交
			commonSubmit: function () {
				this.$refs.commonForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.commonLoading = true;
							let para = Object.assign({}, this.commonForm);
							addDataGroup(para).then((res) => {
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
				var ids = this.sels.map(item => item.groupId).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					let para = { ids: ids };
					removeDataGroup(para).then((res) => {
						this.listLoading = false;
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getDataGroups();
					});
				}).catch(() => {
				});
			},
			hasPermission : function(permission){
				return common.hasPermission(permission);
			}
		},
		mounted() {
			this.getDataGroups();
			this.getDatas();
		}
	}
</script>
