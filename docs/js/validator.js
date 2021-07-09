const BACKEND_URL = "https://dataquality.herokuapp.com/";
// Storage
var themes = [];
var publishers = [];
var titles = [];


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
    let req = new XMLHttpRequest();

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

            // Sort publishers by name
            publishers.sort(sortAlphabetically);

            // Set the themes
            let t = document.getElementById("i-theme");
            t.innerHTML = "<option value=-1>All/Unspecified</option>";
            for (i in themes) {
                let e = document.createElement("option");
                e.innerText = themes[i]["name"];
                e.value = i;
                t.append(e);
            }

            // Set the publishers
            let p = document.getElementById("i-publisher");
            p.innerHTML = "<option value=-1>All/Unspecified</option>";
            for (i in publishers) {
                let e = document.createElement("option");
                e.innerText = publishers[i]["name"];
                e.value = i;
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

            // If there were no errors (didn't return before), enable more fields
            document.getElementById("i-theme").disabled = false;
            document.getElementById("i-publisher").disabled = false;
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

    // First get the data from the form inputs
    let e = document.getElementById("i-endpoint").value;
    let t = document.getElementById("i-theme").value;
    let p = document.getElementById("i-publisher").value;
    let k = document.getElementById("i-keywords").value;
    // Process them a bit
    if (t == -1) t = "All/Unspecified";
    else t = themes[t]["url"];
    if (p == -1) p = "All/Unspecified";
    else p = publishers[p]["url"];
    if (k == "") k = [];
    else {
        // TODO probably do more stuff to clean this up
        k = k.split(',');
        for (i in k) k[i].trim();
    }
    // Compose the object
    let obj = {
        "endpoint": e,
        "theme": t,
        "publisher": p,
        "keywords": k
    }

    // Create the request
    var req = new XMLHttpRequest();
    // This is what happens when the request is updated (sent, response received, error...)
    req.onreadystatechange = function() {
        console.log("Request status: " + req.readyState);
        // If it worked correctly, set the data in the form
        if (req.readyState == 4 && req.status == 200) {
            
            // Parse the response string into an object
            let response = JSON.parse(req.response);
            console.log(response);
            // ...
        }
    }

    req.open("POST", BACKEND_URL + "validateInput", true);
    // We are sending a JSON object so set the header
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(obj));
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
    document.getElementById("i-keywords").disabled = true;
    document.getElementById("i-title").disabled = true;
    // Disable buttons
    document.getElementById("b-apply").classList.add("disabled");
    document.getElementById("b-apply").classList.add("disabled");

    themes = [];
    publishers = [];
    titles = [];

    document.getElementById("i-theme").innerHTML = "<option>None</option>";
    document.getElementById("i-publisher").innerHTML = "<option>None</option>";
    document.getElementById("i-keywords").value = "";
}
