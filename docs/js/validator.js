const BACKEND_URL = "https://dataquality.herokuapp.com/";
const EXCL_MARK = "<i class='bi bi-exclamation-triangle px-1'></i>"
const ERR_MARK = "<i class='bi bi-x-octagon-fill px-1'></i>"
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
                e.firstElementChild.innerHTML = ERR_MARK + " There was an error trying to validate the distribution: " + r["errorProcessing"];
                e.classList.remove("visually-hidden");
                return;
            }

            // Set the results. First reset some fields
            document.getElementById("r-qbar-low").classList.add("visually-hidden");
            document.getElementById("r-qbar-high").classList.add("visually-hidden");
            // Reset analysis result fields
            setElementToValid("r-col-rep");
            setElementToValid("r-txt-zer");
            setElementToValid("r-num-sep");
            setElementToValid("r-dat-iso");
            setElementToValid("r-phn-cod");
            setElementToValid("r-geo-col");


            // ------------
            // -- Fields --
            // ------------

            // This is used to average the subtotals
            let total = [];
            // Track if there is any observation
            let observations = [];

            // Columns
            let st = 100;
            //  - Avoid repetition
            if (r["columnas"]["repeticion"].length > 0) {
                setElementToInvalid("r-col-rep");
                thereIsAnError = true;
                st -= 100;
                if (r["columnas"]["repeticion"].length == 1) {
                    observations.push("There is one repeated column");
                } else {
                    observations.push("There are " + r["columnas"]["repeticion"].length + " repeated columns");
                }
            }
            document.getElementById("r-col-st").innerText = "Subtotal: " + st + "%"
            total.push(st);

            // Text fields
            st = 100;
            //  - Numeric values with zeroes to the left
            if (r["CamposTexto"]["ceroizquierda"].length > 0) {
                setElementToInvalid("r-txt-zer");
                thereIsAnError = true;
                st -= 100;
                if (r["CamposTexto"]["ceroizquierda"].length == 1) {
                    observations.push("There is one text field with a numeric value that contains extra zeroes to its left");
                } else {
                    observations.push("There are " + r["CamposTexto"]["ceroizquierda"].length + " text fields with numeric values that contain extra zeroes to their left");
                }
            }
            document.getElementById("r-txt-st").innerText = "Subtotal: " + st + "%"
            total.push(st);

            // Number fields
            st = 100;
            //  - Decimal separators (varies with region)
            if (r["CampoNumerico"]["Region"].length > 0) {
                setElementToInvalid("r-num-sep");
                thereIsAnError = true;
                st -= 100; // TODO change if there is another one finally
                if (r["CampoNumerico"]["Region"].length == 1) {
                    observations.push("There is one numeric field which does not use the correct decimal separator");
                } else {
                    observations.push("There are " + r["CampoNumerico"]["Region"].length + " numeric fields which do not use the correct decimal separator");
                }
            }
            // TODO the other one?
            document.getElementById("r-num-st").innerText = "Subtotal: " + st + "%"
            total.push(st);

            // Date fields
            st = 100;
            //  - ISO 8601 format
            if (r["Fechas"]["formatoFecha"].length > 0) {
                setElementToInvalid("r-dat-iso");
                thereIsAnError = true;
                st -= 100; // TODO change if there is another one finally
                if (r["Fechas"]["formatoFecha"].length == 1) {
                    observations.push("There is one date field that does not follow the ISO 8601 format");
                } else {
                    observations.push("There are " + r["Fechas"]["formatoFecha"].length + " date fields that do not follow the ISO 8601 format");
                }
            }
            // TODO the other one?
            document.getElementById("r-dat-st").innerText = "Subtotal: " + st + "%"
            total.push(st);

            // Phone number fields
            st = 100;
            //  - Country code
            if (r["CampoTelefono"]["codigopais"].length > 0) {
                setElementToInvalid("r-phn-cod");
                thereIsAnError = true;
                st -= 100;
                if (r["CampoTelefono"]["codigopais"].length > 0) {
                    observations.push("There is one phone number field that does not include the country code");
                } else {
                    observations.push("There are " + r["CampoTelefono"]["codigopais"] + " phone number fields that do not include the country code");
                }
            }
            document.getElementById("r-phn-st").innerText = "Subtotal: " + st + "%"
            total.push(st);

            // Geographic fields
            st = 100;
            //  - Coordinates in separate columns
            if (r["CoordGeoGraficas"]["noSeparadas"].length > 0) {
                setElementToInvalid("r-geo-col");
                thereIsAnError = true;
                st -= 100;
                if (r["CoordGeoGraficas"]["noSeparadas"].length > 0) {
                    observations.push("There is one coordinate that is not represented in separate columns");
                } else {
                    observations.push("There are " + r["CoordGeoGraficas"]["noSeparadas"] + " coordinates that are not represented in separate columns");
                }
            }
            document.getElementById("r-geo-st").innerText = "Subtotal: " + st + "%"
            total.push(st);


            // ------------------
            // -- Progress bar --
            // ------------------

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


            // ------------------
            // -- Observations --
            // ------------------

            // Only show observations if there is any!
            if (thereIsAnError) {

                // Remove all previous observations
                while (document.getElementById("s-observations").children.length > 1) {
                    document.getElementById("s-observations").lastElementChild.remove();
                }

                // Generic observation to build the rest of them
                let obs = document.getElementById("generic-observation").cloneNode(true);
                obs.classList.remove("visually-hidden");

                // Show overall numbers of problems in each category
                for (o in observations) {
                    let e = obs.cloneNode(true);
                    e.firstElementChild.innerHTML = EXCL_MARK + " " + observations[o];
                    document.getElementById("s-observations").appendChild(e);
                }


                // Display observations section
                document.getElementById("s-observations").classList.remove("visually-hidden");
            }


            // Display the results section
            document.getElementById("s-results").classList.remove("visually-hidden");
        }
    }

    req.open("POST", BACKEND_URL + "validateDataset/?datasetLink=" + encodeURIComponent(dist), true);
    req.send(null);
}


function reset() {
    // Disable input fields
    document.getElementById("i-theme").disabled = true;
    document.getElementById("i-publisher").disabled = true;
    document.getElementById("i-keywords").disabled = true;
    document.getElementById("i-title").disabled = true;
    document.getElementById("i-distribution").disabled = true;

    // Disable buttons
    document.getElementById("b-apply").classList.add("disabled");
    document.getElementById("b-title-load").classList.add("disabled");
    document.getElementById("b-dist-validate").classList.add("disabled");

    // Reset input field values
    document.getElementById("i-theme").innerHTML = "<option>None</option>";
    document.getElementById("i-publisher").innerHTML = "<option>None</option>";
    document.getElementById("i-keywords").value = "";
    document.getElementById("i-title").value = "";
    document.getElementById("i-distribution").value = "";

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
