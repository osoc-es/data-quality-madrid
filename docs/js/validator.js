// == DOM stuff ==

/* - Input fields -
 . i-endpoint:  URL
 . i-title:     text
 . i-theme:     select, text
 . i-language:  select, text
 . i-publisher: select, text
 . i-keywords:  text (several values separated by commas)


   - Output fields -
          TBD
*/

const BACKEND_URL = "https://dataquality.herokuapp.com/";
// Storage
var themes = [];
var publishers = [];
var languages = [];


function showError(message) {
    console.log(message);
}


function validate() {
    showError("Validate button was clicked");
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
            // Store themes and publishers
            themes = response["themes"];
            publishers = response["publisher"];
            // Sort publishers by name
            publishers.sort((a, b) => {
                if (a["name"] > b["name"]) return 1;
                else if (a["name"] == b["name"]) return 0;
                else return -1;
            })

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

            // If there were no errors (didn't return before), enable more fields
            document.getElementById("i-title").disabled = false;
            document.getElementById("i-theme").disabled = false;
            document.getElementById("i-language").disabled = false;
            document.getElementById("i-publisher").disabled = false;
            document.getElementById("i-keywords").disabled = false;
        }
    }

    // Send the request asynchronously
    req.open("POST", BACKEND_URL + "themePublisher?endpoint=" + encodeURIComponent(url), true); 
    req.send(null);
}


function reset() {
    document.getElementById("i-title").disabled = true;
    document.getElementById("i-theme").disabled = true;
    document.getElementById("i-language").disabled = true;
    document.getElementById("i-publisher").disabled = true;
    document.getElementById("i-keywords").disabled = true;

    themes = [];
    publishers = [];
    languages = [];

    document.getElementById("i-theme").innerHTML = "<option>None</option>";
    document.getElementById("i-language").innerHTML = "<option>None</option>";
    document.getElementById("i-publisher").innerHTML = "<option>None</option>";
    document.getElementById("i-keywords").value = "";

    // TODO other things (replace values in each field)
}