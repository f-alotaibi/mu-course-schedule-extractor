function downloadSchedules() {
	let data=[];
	for (i = 0; i < rows.length; i++) {
		let rowChildren = rows[i].children
		// Beautify times
		let dataTime = []
		let time = document.getElementById("myForm:timetable:" + i + ":section").value.trim()
		if (time.length > 0) {
			let timeRows = time.split("@n")
			for (let j = 0; j < timeRows.length; j++){
				let timeSplitAtT = timeRows[j].split("@t")
				let timeDay = timeSplitAtT[0].trim()
				let timeSplitAtR = timeSplitAtT[1].split("@r")
				let timeHour = timeSplitAtR[0].trim()
				let timeHall = timeSplitAtR[1].trim()
		
				dataTime.push({
					TimeDay: timeDay,
					TimeHour: timeHour,
					TimeHall: timeHall
				});
			}
		}
		data.push({
			CourseCode: rowChildren[0].outerText,
			CourseName: rowChildren[1].outerText,
			CourseSection: rowChildren[2].outerText,
			CourseActivity: rowChildren[3].outerText,
			CourseHours: rowChildren[4].outerText,
			CourseGender: rowChildren[5].outerText,
			CourseStatus: rowChildren[6].outerText,
			Instructor: document.getElementById("myForm:timetable:" + i + ":instructor").value,
			SectionTimes: dataTime
		});
	}
	var blob = new Blob([JSON.stringify(data, null, "\t")], {type:"text/plain"});
	var reader = new FileReader();
	reader.addEventListener("load", function(e) {
		var file = "data:application/octet-stream;" 
                + e.target.result.split(/;/)[1];
		var saveFile = window.open(file, "_self");
	});
	reader.readAsDataURL(blob);
}
downloadSchedules();
