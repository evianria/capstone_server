module.exports = {
	server_port: 3000,
	route_info: [
        //===== User =====//
        {file:'./user', path:'/process/adduser', method:'adduser', type:'post'}
		,{file:'./user', path:'/process/login', method:'login', type:'post'}					// user.login 
		//===== Commute with Android =====//
		,{file:'./android_login', path:'/process/ancommute', method:'ancommute', type:'post'}				// commute with android
		,{file:'./android_subject', path:'/process/ansubject', method:'ansubject', type:'post'}				// send student's subject list
	]
}