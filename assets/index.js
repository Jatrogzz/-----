
var selector = document.querySelector(".selector_box");
selector.addEventListener('click', () => {
    if (selector.classList.contains("selector_open")){
        selector.classList.remove("selector_open")
    }else{
        selector.classList.add("selector_open")
    }
})

document.querySelectorAll(".date_input").forEach((element) => {
    element.addEventListener('click', () => {
        document.querySelector(".date").classList.remove("error_shown")
    })
})

var sex = "m"

document.querySelectorAll(".selector_option").forEach((option) => {
    option.addEventListener('click', () => {
        sex = option.id;
        document.querySelector(".selected_text").innerHTML = option.innerHTML;
    })
})

var upload = document.querySelector(".upload");

var imageInput = document.createElement("input");
imageInput.type = "file";
imageInput.accept = ".jpeg,.png,.gif";

document.querySelectorAll(".input_holder").forEach((element) => {

    var input = element.querySelector(".input");
    input.addEventListener('click', () => {
        element.classList.remove("error_shown");
    })

});

upload.addEventListener('click', () => {
    imageInput.click();
    upload.classList.remove("error_shown")
});

imageInput.addEventListener('change', (event) => {

    upload.classList.remove("upload_loaded");
    upload.classList.add("upload_loading");

    upload.removeAttribute("selected")

    var file = imageInput.files[0];
    var data = new FormData();
    data.append("image", file);

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 seconds timeout
    });

    // Race between fetch and timeout
    Promise.race([
        fetch('https://api.imgur.com/3/image' ,{
            method: 'POST',
            headers: {
                'Authorization': 'Client-ID ec67bcef2e19c08'
            },
            body: data
        }),
        timeoutPromise
    ])
    .then(result => {
        if (!result.ok) {
            throw new Error(`HTTP error! status: ${result.status}`);
        }
        return result.json();
    })
    .then(response => {
        if (response.success && response.data && response.data.link) {
            var url = response.data.link;
            upload.classList.remove("error_shown")
            upload.setAttribute("selected", url);
            upload.classList.add("upload_loaded");
            upload.classList.remove("upload_loading");
            upload.querySelector(".upload_uploaded").src = url;
        } else {
            throw new Error('Invalid response from server');
        }
    })
    .catch(error => {
        console.error('Image upload failed:', error);
        
        // Try fallback: convert to base64 and use locally
        console.log('Trying fallback: converting image to base64...');
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Url = e.target.result;
            upload.classList.remove("upload_loading");
            upload.classList.remove("error_shown");
            upload.setAttribute("selected", base64Url);
            upload.classList.add("upload_loaded");
            upload.querySelector(".upload_uploaded").src = base64Url;
            console.log('Fallback successful: using base64 image');
        };
        reader.onerror = function() {
            upload.classList.remove("upload_loading");
            upload.classList.add("error_shown");
            
            // Show different error messages based on error type
            let errorMessage = "Błąd podczas przesyłania zdjęcia. Spróbuj ponownie.";
            if (error.message === 'Request timeout') {
                errorMessage = "Przekroczono czas oczekiwania. Sprawdź połączenie internetowe.";
            } else if (error.message.includes('HTTP error')) {
                // Extract status code for more specific error messages
                const statusMatch = error.message.match(/status: (\d+)/);
                if (statusMatch) {
                    const status = parseInt(statusMatch[1]);
                    if (status === 429) {
                        errorMessage = "Zbyt wiele prób. Poczekaj chwilę i spróbuj ponownie.";
                    } else if (status === 403) {
                        errorMessage = "Brak uprawnień do przesyłania. Sprawdź ustawienia API.";
                    } else if (status >= 500) {
                        errorMessage = "Błąd serwera. Spróbuj ponownie za chwilę.";
                    } else {
                        errorMessage = `Błąd serwera (${status}). Spróbuj ponownie.`;
                    }
                } else {
                    errorMessage = "Błąd serwera. Spróbuj ponownie za chwilę.";
                }
            }
            
            upload.querySelector(".error").textContent = errorMessage;
        };
        reader.readAsDataURL(file);
    })

})

document.querySelector(".go").addEventListener('click', () => {

    var empty = [];

    var params = new URLSearchParams();

    params.set("sex", sex)
    if (!upload.hasAttribute("selected")){
        empty.push(upload);
        upload.classList.add("error_shown")
    }else{
        params.set("image", upload.getAttribute("selected"))
    }

    var birthday = "";
    var dateEmpty = false;
    document.querySelectorAll(".date_input").forEach((element) => {
        birthday = birthday + "." + element.value
        if (isEmpty(element.value)){
            dateEmpty = true;
        }
    })

    birthday = birthday.substring(1);

    if (dateEmpty){
        var dateElement = document.querySelector(".date");
        dateElement.classList.add("error_shown");
        empty.push(dateElement);
    }else{
        params.set("birthday", birthday)
    }

    document.querySelectorAll(".input_holder").forEach((element) => {

        var input = element.querySelector(".input");

        if (isEmpty(input.value)){
            empty.push(element);
            element.classList.add("error_shown");
        }else{
            params.set(input.id, input.value)
        }

    })

    if (empty.length != 0){
        empty[0].scrollIntoView();
    }else{

        forwardToId(params);
    }

});

function isEmpty(value){

    let pattern = /^\s*$/
    return pattern.test(value);

}

function forwardToId(params){

    location.href = "/FistaszjoObywatel/id?" + params

}

var guide = document.querySelector(".guide_holder");
guide.addEventListener('click', () => {

    if (guide.classList.contains("unfolded")){
        guide.classList.remove("unfolded");
    }else{
        guide.classList.add("unfolded");
    }

})
