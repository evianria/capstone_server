module.exports = {
	server_port: 3000,
	route_info: [
        //===== Web =====//
		{file:'./add_student', path:'/process/adduser', method:'adduser', type:'post'}
		,{file:'./add_professor', path:'/process/profadd', method:'profadd', type:'post'}
		,{file:'./web_login', path:'/process/login', method:'login', type:'post'}				// user.login
		,{file:'./image_main', path:'/process/loginre', method:'loginre', type:'get'} 
		,{file:'./web_login', path:'/process/logout', method:'logout', type:'post'}
		,{file:'./subject_student', path:'/process/subjectlist', method:'subjectlist', type:'get'}
		,{file:'./attend_button', path:'/process/attstart', method:'attstart', type:'post'}
		,{file:'./attend_button', path:'/process/attstop', method:'attstop', type:'post'}
		,{file:'./student_calendar', path:'/process/stucalendar', method:'stucalendar', type:'get'}
		,{file:'./student_calendar', path:'/process/updatestate', method:'updatestate', type:'post'}
		,{file:'./web_login', path:'/process/lastMonth', method:'lastMonth', type:'post'}
		,{file:'./web_login', path:'/process/nextMonth', method:'nextMonth', type:'post'}
		//===== Commute with Android =====//
		,{file:'./android', path:'/process/ancommute', method:'ancommute', type:'post'}				// commute with android
		,{file:'./android', path:'/process/ansubject', method:'ansubject', type:'post'}				// send student's subject list
		,{file:'./android', path:'/process/ancalendar', method:'ancalendar', type:'post'}
		//===== Sonsor =====//
		,{file:'./sensor', path:'/process/sensorimg', method:'sensorimg', type:'post'}
	]
}