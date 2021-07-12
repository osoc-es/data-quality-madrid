const BACKEND_URL = "https://dataquality.herokuapp.com/";
// Storage
var themes = [];
var publishers = [];
var titles = [];
var titleResults = [];
var genericTitle = document.getElementById("generic-title").cloneNode(true);
genericTitle.classList.remove("visually-hidden");
var issueEnabled = true;
var modificationEnabled = true;



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
            titles = response["results"];
            console.log(titles);
            // Now the user can search their stuff
            
            // Set the language list
            let langs = [];
            for (i in titles) if (!langs.includes(titles[i]["lang"])) langs.push(titles[i]["lang"]);
            let l = document.getElementById("i-language");
            l.innerHTML = "<option>All</option>";
            for (i in langs) {
                let e = document.createElement("option");
                e.innerText = langs[i];
                //e.value = i;
                l.append(e);
            }

            // Enable fields
            document.getElementById("i-title").disabled = false;
            document.getElementById("i-language").disabled = false;
            document.getElementById("i-issue").disabled = false;
            document.getElementById("i-modification").disabled = false;

            // Show titles
            searchTitles();
        }
    }

    req.open("POST", BACKEND_URL + "getDatasets", true);
    // We are sending a JSON object so set the header
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(obj));
}


function searchTitles() {
    // First retrieve search filters
    let title = document.getElementById("i-title").value;
    let language = document.getElementById("i-language").value;
    let issue = document.getElementById("i-issue").value;
    let modification = document.getElementById("i-modification").value;
    console.log(title);
    console.log(language);
    console.log(issue);
    console.log(modification);

    // Start with all titles
    titleResults = titles.slice();

    // Remove all elements that do not fit any of the filters
    for (i in titleResults) {
        
        // Check whether the title is contained in the dataset title
        if (title != "" && !titleResults[i]["title"].includes(title)) {
            console.log("Removed " + titleResults[i]["title"] + ": it does not contain '" + title + "'");
            titleResults.splice(i, 1);
            continue;
        }
        
        // Check whether the language matches
        if (language != "All" && titleResults[i]["lang"] != language) {
            console.log("Removed " + titleResults[i]["title"] + ": its language (" + titleResults[i]["lang"] + ") is not " + language);
            titleResults.splice(i, 1);
            continue;
        }

        // Check whether issue date is enabled and matches
        let date = new Date(titleResults[i]["issued"]);
        if (issueEnabled && date.getFullYear() != issue) {
            console.log("Removed " + titleResults[i]["title"] + ": its issue date is " + date.getFullYear() + " instead of " + issue);
            titleResults.splice(i, 1);
            continue;
        }

        // Check whether modification date is enabled and matches
        date = new Date(titleResults[i]["modified"]);
        if (modificationEnabled && date.getFullYear() != modification) {
            console.log("Removed " + titleResults[i]["title"] + ": its modification date is " + date.getFullYear() + " instead of " + modification);
            titleResults.splice(i, 1);
            continue;
        }
    }
}


function toggleIssue() {
    issueEnabled = !issueEnabled;
    document.getElementById("b-toggle-issue").innerText = issueEnabled ? "On" : "Off";
}


function toggleModification() {
    modificationEnabled = !modificationEnabled;
    document.getElementById("b-toggle-modification").innerText = modificationEnabled ? "On" : "Off";
}


function validate(type) {
    if (type == 'form') {
        showError("Validating using form data");
    } else {
        showError("Validating using direct URL for element " + type);
    }
}


function reset() {
    // Disable input fields
    document.getElementById("i-theme").disabled = true;
    document.getElementById("i-publisher").disabled = true;
    document.getElementById("i-keywords").disabled = true;
    document.getElementById("i-title").disabled = true;
    document.getElementById("i-language").disabled = true;
    document.getElementById("i-issue").disabled = true;
    document.getElementById("i-modification").disabled = true;

    // Disable buttons
    document.getElementById("b-apply").classList.add("disabled");

    // Reset input field values
    document.getElementById("i-theme").innerHTML = "<option>None</option>";
    document.getElementById("i-publisher").innerHTML = "<option>None</option>";
    document.getElementById("i-keywords").value = "";
    document.getElementById("i-title").value = "";
    document.getElementById("i-language").value = "All";
    document.getElementById("i-issue").value = 2021;
    document.getElementById("i-modification").value = 2021;

    // Free storage
    themes = [];
    publishers = [];
    titles = [];

    // Reset title results
    document.getElementById("s-title-results").innerHTML = "";
    //document.getElementById("s-title-results").appendChild(genericTitle.cloneNode(true));
}
