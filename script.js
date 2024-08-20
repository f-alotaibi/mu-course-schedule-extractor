// visit https://edugate.mu.edu.sa/mu/ui/guest/timetable/index/scheduleTreeCoursesIndex.faces and run the script.
// you should probably check the sleep time between each request.
function fetchScheduleEdugate() {
    let viewStateID = document.getElementById("j_id_id0:javax.faces.ViewState:3").value
    let sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

    function downloadSchedules(major, html) {
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");
        let data = [];
        let rows = doc.getElementById("myForm:timetable").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
        for (i = 0; i < rows.length; i++) {
            let rowChildren = rows[i].children
            let dataTime = []
            let time = doc.getElementById("myForm:timetable:" + i + ":section").value.trim()
            if (time.length > 0) {
                let timeRows = time.split("@n")
                for (let j = 0; j < timeRows.length; j++) {
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
                Instructor: doc.getElementById("myForm:timetable:" + i + ":instructor").value,
                SectionTimes: dataTime
            });
        }
        var blob = new Blob([JSON.stringify(data, null, "\t")], {
            type: "text/plain"
        });
    
        let url = URL.createObjectURL(blob);
    
        let tempA = document.createElement('a');
    
        tempA.href = url;
        tempA.download = `${campusName}_${degreeName}_${major["Name"]}_schedule_extract.json`; // Change this to your preferred filename
    
        document.body.appendChild(tempA);
    
        tempA.click();
    
        document.body.removeChild(tempA);
        URL.revokeObjectURL(url);
    }

    function doFormRequest(major) {
        body = {
            "myForm": "myForm",
            "myForm:select2": campus,
            "myForm:select1": degree,
            "myForm:index": major,
            "javax.faces.ViewState": viewStateID,
        }
        if (major != "") {
            body["myForm:commandLink"] = "myForm:commandLink"
        }
        return fetch('https://edugate.mu.edu.sa/mu/ui/guest/timetable/index/scheduleTreeCoursesIndex.faces', {
            method: 'POST',
            body: new URLSearchParams(body),
        }).then((response) => {
            return response.text();
        })
    }

    function fetchScheduleTable(major) {
        doFormRequest(major["Code"]).then((html) => {
            downloadSchedules(major, html);
        })
    }

    function fetchScheduleList() {
        doFormRequest("").then((html) => {
            let text = html.split("document.write(tree);")[0];
            text = text.split("tree = new dTree('tree', ")[1].substring(6);
            textSplit = text.split("\r\n                                    ").filter((line) => line.includes("javascript:setIndex("));
            let majors = []
            for (let i = 0; i < textSplit.length; i++) {
                textSplitPart = textSplit[i]
                majors.push({
                    Name: textSplitPart.split(", ")[2].replace("'", ""),
                    Code: textSplitPart.split("javascript:setIndex(")[1].split(");")[0]
                })
            }
            goThroughEachMajor(majors);
        });
    }
    async function goThroughEachMajor(majors) {
        for (let i = 0; i < majors.length; i++) {
            fetchScheduleTable(majors[i]);
            await sleep(100); // preferably, you should change the timeout to something like 500ms but its up to you.
        }
    }
    /*
    let campuses = [
        "32", // Majmaah (M)
        "47", // Majmaah (F)
        "61", // Ghat (M)
        "62", // Ghat (F)
        "64", // Zulfi (M)
        "65", // Zulfi (F)
        "68", // Hota (M)
        "67", // Hota (F)
        "71", // Rmaah (M)
        "69", // Rmaah (F)
        "70", // Majmaah (M) Evening studies
    ];
    let degrees = [
        "3", // Diploma
        "4", // Bachelors
        "5", // Masters
        "6", // Shared
        "7", // Transitional
        "8", // No degree
        "11" // Associate
    ]
        */
    let campusesSelectElement = document.getElementById("myForm:select2")
    let degreeSelectElement = document.getElementById("myForm:select1")
    let campus = campusesSelectElement.value
    let degree = degreeSelectElement.value
    let campusName = campusesSelectElement.children[campusesSelectElement.selectedIndex].innerText
    let degreeName = degreeSelectElement.children[degreeSelectElement.selectedIndex].innerText
    fetchScheduleList();
}
fetchScheduleEdugate()
