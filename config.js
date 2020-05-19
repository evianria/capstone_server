module.exports = {
	server_port: 3000,
	route_info: [
        //===== User =====//
        {file:'./user', path:'/process/adduser', method:'adduser', type:'post'}
	    ,{file:'./user', path:'/process/login', method:'login', type:'post'}					// user.login 
		,{file:'./android', path:'/process/ancommute', method:'ancommute', type:'post'}				// commute with android
	]
}