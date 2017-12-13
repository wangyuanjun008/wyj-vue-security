<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.operation" placeholder="操作名称"></el-input>
				</el-form-item>
				<el-form-item v-if="hasPermission('log:remove')">
					<el-button type="primary" v-on:click="getLogs">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="logs" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;" height=480>
			<el-table-column type="selection" fit=true></el-table-column>
			<el-table-column type="index" fit=true></el-table-column>
			<el-table-column prop="operation" label="操作" fit=true sortable></el-table-column>
			<el-table-column prop="method" label="方法"fit=true sortable></el-table-column>
			<el-table-column prop="params" label="参数" fit=true sortable></el-table-column>
			<el-table-column prop="time" label="耗时" fit=true sortable></el-table-column>
			<el-table-column prop="createTime" label="创建时间" fit=true sortable></el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

	</section>
</template>

<script>
	import util from '../../util/js/util'
	import common from '../../util/js/common.js';
	import { getLogPage} from '../../api/api';
	export default {
		data() {
			return {
				filters: {
					operation: ''
				},
				logs: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: []//列表选中列
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.page = val;
				this.getLogs();
			},
			//获取列表
			getLogs() {
				let para = {
					offset: this.page,
					operation: this.filters.operation
				};
				this.listLoading = true;
				getLogPage(para).then((res) => {
					this.total = res.data.total;
					this.logs = res.data;
					this.listLoading = false;
				});
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			hasPermission : function(permission){
				return common.hasPermission(permission);
			}
		},
		mounted() {
			this.getLogs();
		}
	}
</script>
