// visit https://edugate.mu.edu.sa/mu/ui/guest/timetable/index/scheduleTreeCoursesIndex.faces and run the script.
function downloadSchedules(campus, degree, major, html) {
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
    tempA.download = `${campus}_${degree}_${major}_schedule_extract.json`; // Change this to your preferred filename

    document.body.appendChild(tempA);

    tempA.click();

    document.body.removeChild(tempA);
    URL.revokeObjectURL(url);
}

function fetchScheduleEdugate() {
    let viewStateID = document.getElementById("j_id_id0:javax.faces.ViewState:3").value
    let sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

    function fetchScheduleTable(campus, degree, major) {
        let nFormData = new FormData();
        nFormData.append("myForm", "myForm");
        nFormData.append("myForm:select2", campus);
        nFormData.append("myForm:select1", degree);
        nFormData.append("myForm:index", major);
        nFormData.append("javax.faces.ViewState", viewStateID);
        nFormData.append("myForm:commandLink", "myForm:commandLink");
        fetch('https://edugate.mu.edu.sa/mu/ui/guest/timetable/index/scheduleTreeCoursesIndex.faces', {
                method: 'POST',
                body: new URLSearchParams(nFormData),
            })
            .then((response) => {
                return response.text();
            })
            .then((html) => {
                downloadSchedules(campus, degree, major, html);
            });
    }

    function fetchScheduleList(campus, degree) {
        let nFormData = new FormData();
        nFormData.append("myForm", "myForm");
        nFormData.append("myForm:select2", campus);
        nFormData.append("myForm:select1", degree);
        nFormData.append("myForm:index", "");
        nFormData.append("javax.faces.ViewState", viewStateID);
        fetch('https://edugate.mu.edu.sa/mu/ui/guest/timetable/index/scheduleTreeCoursesIndex.faces', {
                method: 'POST',
                body: new URLSearchParams(nFormData),
            })
            .then((response) => {
                return response.text();
            })
            .then((html) => {
                let text = html.split("document.write(tree);")[0];
                text = text.split("tree = new dTree('tree', 'Ar');")[1];
                textSplit = text.split("\r\n                                    ");
                let majors = []
                for (let i = 0; i < textSplit.length; i++) {
                    textSplitPart = textSplit[i]
                    if (!textSplitPart.includes("javascript:setIndex(")) {
                        continue
                    }
                    majors.push(textSplitPart.split("javascript:setIndex(")[1].split(");")[0])
                }
                document.body.innerHTML = `working on campus no ${campus}`
                goThroughEachMajor(campus, degree, majors);
            });
    }
    async function goThroughEachMajor(campus, degree, majors) {
        for (let i = 0; i < majors.length; i++) {
            document.body.innerHTML = `working on campus no ${campus} degree ${degree} now at major ${majors[i]}`
            fetchScheduleTable(campus, degree, majors[i]);
            await sleep(500); // sleep for 500ms so u dont get blocked
        }
    }
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
    fetchScheduleList(campuses[0], degrees[1]);
}
fetchScheduleEdugate()
