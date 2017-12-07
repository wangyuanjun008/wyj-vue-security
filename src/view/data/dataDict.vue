<template>
	<div>
		<el-row>
			<el-col :span="4">
					<ul id="treeDemo" class="ztree" url="/remote/dataDict/renderTree"></ul>
			</el-col>
			<el-col :span="20">
				<section>
					<!--工具条-->
					<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
						<el-form :inline="true" :model="filters">
							<el-form-item>
								<el-input v-model="filters.dictCode" placeholder="编码"></el-input>
								<el-input type='hidden' v-model="filters.dataGroupId" placeholder="编码"></el-input>
							</el-form-item>
							<el-form-item>
								<el-button type="primary" v-on:click="getDataDicts">查询</el-button>
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
					<el-table :data="dataDicts" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;" height=480>
						<el-table-column type="selection" fit=true>
						</el-table-column>
						<el-table-column type="index" fit=true>
						</el-table-column>
						<el-table-column prop="dictCode" label="编码" fit=true sortable>
						</el-table-column>
						<el-table-column prop="dictName" label="名称"fit=true sortable>
						</el-table-column>
						<el-table-column prop="remark" label="描述" fit=true sortable>
						</el-table-column>
						<el-table-column prop="status" label="使用状态" fit=true :formatter="formatStatus" sortable>
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
									<el-form-item label="编码" prop="dictCode">
										<el-input v-model="commonForm.dictCode" auto-complete="off"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col>
									<el-form-item label="名称" prop="dictName">
										<el-input v-model="commonForm.dictName" auto-complete="off"></el-input>
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
							<el-input v-model="commonForm.dictId" type="hidden" auto-complete="off"></el-input>
							<el-input v-model="commonForm.dataGroup.groupId" type="hidden" auto-complete="off"></el-input>
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
	import util from '../../util/js/util'
	import { getDataDictListPage,addDataDict,removeDataDict,getData,getDataStore} from '../../api/api';
	export default {
		data() {
			return {
				filters: {
					dictCode: ''
				},
				dataDicts: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列
				commonFormVisible: false,//界面是否显示
				commonLoading: false,
				commonFormRules: {
					dictCode: [
						{ required: true, message: '请输入编码', trigger: 'blur' }
					],
					dictName: [
						{ required: true, message: '请输入名称', trigger: 'blur' }
					]
				},
				//界面数据重置
				commonForm: {
					dictId: '',
					dictCode: '',
					dictName: '',
					remark: '',
					status: '',
					dataGroup:{
						groupId: ''
					}
				},
				items : getDataStore('/remote/dataDict/getData?groupCode='+'yesOrNo')
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
				this.getDataDicts();
			},
			//获取列表
			getDataDicts() {
				let para = {
					offset: this.page,
					dataGroupId: this.filters.dataGroupId
				};
				this.listLoading = true;
				getDataDictListPage(para).then((res) => {
					this.total = res.data.total;
					this.dataDicts = res.data;
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
					let para = { ids: row.dictId };
					removeDataDict(para).then((res) => {
						this.listLoading = false;
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getDataDicts();
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
				if(!this.filters.dataGroupId){
			        this.$message({
			          message: '请选择左侧树的一条数据分组',
			          type: 'warning'
			        });	
			        return;				
				}
				this.commonFormVisible = true;
				this.commonForm = {
					dictId: '',
					dictCode: '',
					dictName: '',
					remark: '',
					status: '',
					dataGroup:{
						groupId: this.filters.dataGroupId
					}
				};
				//表单数据分组赋值
			},
			//提交
			commonSubmit: function () {
				var _this = this;
				this.$refs.commonForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.commonLoading = true;
							let para = Object.assign({}, this.commonForm);
							delete para.dataGroup;
							para['dataGroup.groupId'] = _this.filters.dataGroupId;
							addDataDict(para).then((res) => {
								this.commonLoading = false;
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['commonForm'].resetFields();
								this.commonFormVisible = false;
								this.getDataDicts();
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
				var ids = this.sels.map(item => item.dictId).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					let para = { ids: ids };
					removeDataDict(para).then((res) => {
						this.listLoading = false;
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getDataDicts();
					});
				}).catch(() => {
				});
			},
			//加载树
			getDataGroupTree : function(){
				var _this = this;
			    var jsonTree = getDataStore($("#treeDemo").attr("url"));
		        var setting = {
		            data : {
		                simpleData : {
		                    enable : true,
		                    idKey : "id",
		                    pIdKey : "parentId",
		                    rootPId : 0
		                },
		                key : {
		                    url : "xUrl"
		                }
		            },
		            callback : {
		                onClick : function(event, treeId, treeNode, clickFlag){
		                	_this.filters.dataGroupId=treeNode.id;
		                	_this.getDataDicts();
		                }
		            }
		        };
            	$.fn.zTree.init($("#treeDemo"), setting, jsonTree);
			},
			//重新加载树
			reloadTree : function(){
			    var jsonTree = getDataStore($("#treeDemo").attr("url"));
			    $.fn.zTree.destroy("treeDemo");
			    $.fn.zTree.init($("#treeDemo"), setting, jsonTree);
			}
		},
		mounted() {
			//加载列表
			this.getDataDicts();
			//加载字典表
			//this.getDatas();
			//加载树
			this.getDataGroupTree();
		}
	}
</script>
