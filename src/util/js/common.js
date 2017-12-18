import Vue from 'vue'
export default{
	hasPermission : function(permission){
	    if(this.isNullOrEmpty(window.perms)) {
	    	return false;
	    }
		if (window.perms.indexOf(permission) > -1) {
	        return true;
	    } else {
	        return false;
	    }
	},
	isNullOrEmpty : function (obj) {
	    if ((typeof (obj) == "string" && obj == "") || obj == null || obj == undefined) {
	        return true;
	    } else {
	        return false;
	    }
	}
}