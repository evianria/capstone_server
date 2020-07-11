module.exports = {
	server_port: 3000,
	route_info: [
        //===== User =====//
        {file:'./user', path:'/process/adduser', method:'adduser', type:'post'}
		,{file:'./user', path:'/process/login', method:'login', type:'post'}				// user.login
		// ,{file:'./user', path:'/process/loginProf', method:'loginProf', type:'post'} 
		//===== Web =====//
		,{file:'./web', path:'/process/profinfor', method:'profinfor', type:'post'}
		,{file:'./web', path:'/process/attstart', method:'attstart', type:'post'}
		,{file:'./web', path:'/process/websubject', method:'websubject', type:'post'}
		//===== Commute with Android =====//
		,{file:'./android', path:'/process/ancommute', method:'ancommute', type:'post'}				// commute with android
		,{file:'./android', path:'/process/ansubject', method:'ansubject', type:'post'}				// send student's subject list
		,{file:'./android', path:'/process/ancalendar', method:'ancalendar', type:'post'}
		//===== Sonsor =====//
		,{file:'./sensor', path:'/process/sensorimg', method:'sensorimg', type:'post'}
	]
}