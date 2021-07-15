const BACKEND_URL = "https://dataquality.herokuapp.com/";
// Storage
let themes = [];
let publishers = [];
let titles = [];
let dists = [];



let selectable = ["s-option1", "s-option2"];
function select(elem) {
    // First hide all elements
    for (i in selectable) {
        document.getElementById(selectable[i]).classList.add("visually-hidden");
    }
    // Then unhide the one we selected
    document.getElementById(elem).classList.remove("visually-hidden");
}


function sortByName(a, b) {
    if (a["name"] > b["name"]) return 1;
    else if (a["name"] == b["name"]) return 0;
    else return -1;
}


function sortByTitle(a, b) {
    if (a["title"] > b["title"]) return 1;
    else if (a["title"] == b["title"]) return 0;
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
        console.log("loadEndpoint() request status: " + req.readyState);
        // If it worked correctly, set the data in the form
        if (req.readyState == 4 && req.status == 200) {
            
            // Parse the response string into an object
            let response = JSON.parse(req.response);
            // Store stuff
            themes = response["themes"];
            publishers = response["publisher"];

            // Sort publishers by name
            publishers.sort(sortByName);

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
    let req = new XMLHttpRequest();
    // This is what happens when the request is updated (sent, response received, error...)
    req.onreadystatechange = function() {
        console.log("applyFilters() request status: " + req.readyState);
        // If it worked correctly, set the data in the form
        if (req.readyState == 4 && req.status == 200) {
            
            // Parse the response string into an object
            let response = JSON.parse(req.response);
            titles = response["results"];

            // Sort the titles
            titles.sort(sortByTitle);

            // Put the titles into the datalist in the HTML
            let list = document.getElementById("i-title");
            list.innerHTML = "";
            for (i in titles) {
                let e = document.createElement("OPTION");
                e.innerText = titles[i]["title"];
                e.value = i;
                list.appendChild(e);
            }

            // Enable fields
            document.getElementById("i-title").disabled = false;
            document.getElementById("b-title-load").classList.remove("disabled");
        }
    }

    req.open("POST", BACKEND_URL + "getDatasets", true);
    // We are sending a JSON object so set the header
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(obj));
}


function loadTitle() {

    // Retrieve the selected dataset
    let dataset = document.getElementById("i-title").value;
    dataset = titles[dataset]["dataset"];

    // Create the request
    let req = new XMLHttpRequest();
    // This is what happens when the request is updated (sent, response received, error...)
    req.onreadystatechange = function() {
        console.log("loadTitle() request status: " + req.readyState);
        // If it worked correctly, set the data in the form
        if (req.readyState == 4 && req.status == 200) {
            
            // Parse the response string into an object
            let response = JSON.parse(req.response);
            console.log(response);
            dists = response["results"];

            // Sort the titles
            dists.sort(sortByName);
            console.log(dists);

            // Put the titles into the datalist in the HTML
            let list = document.getElementById("i-distribution");
            list.innerHTML = "";
            for (i in dists) {
                let e = document.createElement("OPTION");
                e.innerText = dists[i]["name"];
                e.value = i;
                list.appendChild(e);
            }

            // Enable fields
            document.getElementById("i-distribution").disabled = false;
            document.getElementById("b-dist-validate").classList.remove("disabled");
        }
    }

    req.open("POST", BACKEND_URL + "getDistributions/?distributionUri=" + encodeURIComponent(dataset), true);
    // We are sending a JSON object so set the header
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(null);
}


function setElementToInvalid(id) {
    document.getElementById(id).classList.remove("text-secondary");
    document.getElementById(id).classList.add("text-primary");
    document.getElementById(id).firstChild.classList.remove("bi-check-lg");
    document.getElementById(id).firstChild.classList.add("bi-x-lg");
}


function setElementToValid(id) {
    document.getElementById(id).classList.remove("text-primary");
    document.getElementById(id).classList.add("text-secondary");
    document.getElementById(id).firstChild.classList.remove("bi-x-lg");
    document.getElementById(id).firstChild.classList.add("bi-check-lg");
}


function validate(type) {
    let dist = "";
    if (type == 'form') {
        dist = document.getElementById("i-direct-dist").value;
        console.log("Validating using form data: " + dist);
    } else {
        dist = document.getElementById("i-distribution").value;
        dist = dists[dist]["url"];
        console.log("Validating using search: " + dist);
    }

    // Create the request
    let req = new XMLHttpRequest();
    // This is what happens when the request is updated (sent, response received, error...)
    req.onreadystatechange = function() {
        console.log("validate() request status: " + req.readyState);
        // If it worked correctly, set the data in the form
        if (req.readyState == 4 && req.status == 200) {
            
            // Parse the response string into an object
            let r = JSON.parse(req.response);
            console.log(r);

            // If there was an error, show it and do not process the rest of the stuff
            let e = document.getElementById("error-message");
            if (r["errorProcessing"] === "") {
                e.classList.add("visually-hidden");
            } else {
                e.firstElementChild.innerText += " " + r["errorProcessing"];
                e.classList.remove("visually-hidden");
                return;
            }

            // Set the results. First reset some fields
            document.getElementById("r-qbar-low").classList.add("visually-hidden");
            document.getElementById("r-qbar-high").classList.add("visually-hidden");
            // Reset analysis result fields
            setElementToValid("r-col-rep");
            //setElementToValid("r-unk-com");
            setElementToValid("r-txt-zer");
            setElementToValid("r-num-sep");
            //setElementToValid("r-num-par");
            setElementToValid("r-dat-iso");
            setElementToValid("r-phn-cod");

            // This is used to average the subtotals
            let total = [];

            // Columns
            let st = 100;
            //  - Avoid repetition
            if (r["columnas"]["repeticion"].length > 0) {
                setElementToInvalid("r-col-rep");
                st -= 100;
            }
            document.getElementById("r-col-st").innerText = "Subtotal: " + st + "%"
            total.push(st);

            // Unknown values
            /*st = 100;
            //  - Common code
            // TODO not present in the response for now
            document.getElementById("r-unk-st").innerText = "Subtotal: " + st + "%"*/

            // Text fields
            st = 100;
            //  - Numeric values with zeroes to the left
            if (r["CamposTexto"]["ceroizquierda"].length > 0) {
                setElementToInvalid("r-txt-zer");
                st -= 100;
            }
            document.getElementById("r-txt-st").innerText = "Subtotal: " + st + "%"
            total.push(st);

            // Number fields
            st = 100;
            //  - Decimal separators (varies with region)
            if (r["CampoNumerico"]["Region"].length > 0) {
                setElementToInvalid("r-num-sep");
                st -= 100; // TODO change if there is another one finally
            }
            // TODO the other one?
            document.getElementById("r-num-st").innerText = "Subtotal: " + st + "%"
            total.push(st);

            // Date fields
            st = 100;
            //  - ISO 8601 format
            if (r["Fechas"]["formatoFecha"].length > 0) {
                setElementToInvalid("r-dat-iso");
                st -= 100; // TODO change if there is another one finally
            }
            // TODO the other one?
            document.getElementById("r-dat-st").innerText = "Subtotal: " + st + "%"
            total.push(st);

            // Phone number fields
            st = 100;
            //  - Country code
            if (r["CampoTelefono"]["codigopais"].length > 0) {
                setElementToInvalid("r-phn-cod");
                st -= 100;
            }
            document.getElementById("r-phn-st").innerText = "Subtotal: " + st + "%"
            total.push(st);


            // Change the progress bar
            total = Math.round(total.reduce((a, b) => a + b) / total.length);
            if (total > 30) {
                // Use high bar
                let bar = document.getElementById("r-qbar-high");
                bar.setAttribute("aria-valuenow", total);
                bar.firstElementChild.style.width = total + "%";
                bar.firstElementChild.firstElementChild.innerText = "quality: " + total + "%"
                // Show
                bar.classList.remove("visually-hidden");

            } else {
                // Use low bar
                let bar = document.getElementById("r-qbar-low")
                bar.setAttribute("aria-valuenow", total);
                bar.firstElementChild.style.width = total + "%";
                bar.lastElementChild.style.width = (100 - total) + "%";
                bar.lastElementChild.firstChild.innerText = "quality: " + total + "%"
                // Show
                bar.classList.remove("visually-hidden");
            }


            // Display the results section
            document.getElementById("s-results").classList.remove("visually-hidden");
        }
    }

    req.open("POST", BACKEND_URL + "validateDataset/?datasetLink=" + encodeURIComponent(dist), true);
    // We are sending a JSON object so set the header
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(null);
}


function reset() {
    // Disable input fields
    document.getElementById("i-theme").disabled = true;
    document.getElementById("i-publisher").disabled = true;
    document.getElementById("i-keywords").disabled = true;
    document.getElementById("i-title").disabled = true;

    // Disable buttons
    document.getElementById("b-apply").classList.add("disabled");
    document.getElementById("b-title-load").classList.add("disabled");
    document.getElementById("b-dist-validate").classList.add("disabled");

    // Reset input field values
    document.getElementById("i-theme").innerHTML = "<option>None</option>";
    document.getElementById("i-publisher").innerHTML = "<option>None</option>";
    document.getElementById("i-keywords").value = "";
    document.getElementById("i-title").value = "";

    // Hide analysis results
    document.getElementById("s-results").classList.add("visually-hidden");
    // Hide error message
    document.getElementById("error-message").classList.add("visually-hidden");

    // Free storage
    themes = [];
    publishers = [];
    titles = [];
    dists = [];
}
