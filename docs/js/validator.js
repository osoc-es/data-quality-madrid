const BACKEND_URL = "https://dataquality.herokuapp.com/";
// Storage
var themes = [];
var publishers = [];
//var adminLevels = [];


let selectable = ["s-option1", "s-option2"];
function select(elem) {
    // First hide all elements
    for (i in selectable) {
        document.getElementById(selectable[i]).classList.add("visually-hidden");
    }
    // Then unhide the one we selected
    document.getElementById(elem).classList.remove("visually-hidden");
}


function sortAlphabetically(a, b) {
    if (a["name"] > b["name"]) return 1;
    else if (a["name"] == b["name"]) return 0;
    else return -1;
}


function showError(message) {
    console.log(message);
}


function loadEndpoint() {
    showError("Load button was clicked");

    // Retrieve the URL from the form
    let url = document.getElementById("i-endpoint").value;
    // (test its validity?)
    // ...
    // Ask the backend for theme and publisher data
    var req = new XMLHttpRequest();

    // This is what happens when the request is updated (sent, response received, error...)
    req.onreadystatechange = function() {
        console.log("Request status: " + req.readyState);
        // If it worked correctly, set the data in the form
        if (req.readyState == 4 && req.status == 200) {        
            
            // Parse the response string into an object
            let response = JSON.parse(req.response);
            // Store stuff
            themes = response["themes"];
            publishers = response["publisher"];
            //adminLevels = response["adminLevel"];

            // Sort publishers by name
            publishers.sort(sortAlphabetically);
            // Sort admin levels by name
            //adminLevels.sort(sortAlphabetically);

            // Set the themes
            let t = document.getElementById("i-theme");
            t.innerHTML = "<option>All/Unspecified</option>";
            for (i in themes) {
                let e = document.createElement("option");
                e.innerText = themes[i]["name"];
                t.append(e);
            }

            // Set the publishers
            let p = document.getElementById("i-publisher");
            p.innerHTML = "<option>All/Unspecified</option>";
            for (i in publishers) {
                let e = document.createElement("option");
                e.innerText = publishers[i]["name"];
                p.append(e);
            }
            /*let p = document.getElementById("i-publisherdl");
            p.disabled = true;
            p.innerHTML = "<option>All/Unspecified</option>";
            for (i in publishers) {
                let e = document.createElement("option");
                e.innerText = publishers[i]["name"];
                p.append(e);
            }
            p.disabled = false;*/

            // Set the administration levels
            /*let a = document.getElementById("i-level");
            a.innerHTML = "<option>All/Unspecified</option>";
            for (i in adminLevels) {
                let e = document.createElement("option");
                e.innerText = publishers[i]["name"];
                a.append(e);
            }*/
            

            // If there were no errors (didn't return before), enable more fields
            document.getElementById("i-theme").disabled = false;
            document.getElementById("i-publisher").disabled = false;
            //document.getElementById("i-level").disabled = false;
            document.getElementById("i-keywords").disabled = false;
            // And enable "apply filters" button
            document.getElementById("b-apply").classList.remove("disabled");
        }
    }

    // Send the request asynchronously
    req.open("POST", BACKEND_URL + "themePublisher?endpoint=" + encodeURIComponent(url), true); 
    req.send(null);
}


function applyFilters() {
    // Send:
    //  - theme: text or 'All/Unspecified'
    //  - publisher: text or 'All/Unspecified'
    //  - keywords: list of words, or empty list
}


function validate(type) {
    if (type == 'form') {
        showError("Validating using form data");
    } else {
        showError("Validating using direct URL")
    }
}


function reset() {
    // Disable input fields
    document.getElementById("i-theme").disabled = true;
    document.getElementById("i-publisher").disabled = true;
    //document.getElementById("i-level").disabled = true;
    document.getElementById("i-keywords").disabled = true;
    document.getElementById("i-title").disabled = true;
    // Disable buttons
    document.getElementById("b-apply").classList.add("disabled");
    document.getElementById("b-apply").classList.add("disabled");

    themes = [];
    publishers = [];
    //adminLevels = [];

    document.getElementById("i-theme").innerHTML = "<option>None</option>";
    document.getElementById("i-publisher").innerHTML = "<option>None</option>";
    //document.getElementById("i-level").innerHTML = "<option>None</option>";
    document.getElementById("i-keywords").value = "";
}
