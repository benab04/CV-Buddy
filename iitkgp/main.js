function initCv() {
    fetch('https://cv-buddy-six.vercel.app/getCv')
        .then(response => response.json())
        .then(data => {
            if (data) {
                let cvData = JSON.parse(data.data);
                console.log(cvData);
                if (cvData)// Assuming there is only one CV entry
                    cv.innerHTML = cvData[0].data;
            }
        })
        .catch(error => console.error('Error fetching CV data:', error));
}

$('#getCV').on("click", () => {
    initCv();
})


function saveCvData() {
    const cvData = cv.innerHTML;

    fetch('https://cv-buddy-six.vercel.app/saveCv', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: cvData })
    }).then(response => response.json())
        .then(data => {
            console.log(data.message);
        })
        .catch(error => console.error('Error saving CV data:', error));
}

let lastCvData = cv.innerHTML;
setInterval(() => {
    const currentCvData = cv.innerHTML;

    if (currentCvData !== lastCvData && $('#toggleAutoSave').text() !== "Enable Autosave" && $('#toggleAutoSave').length) {
        lastCvData = currentCvData;
        saveCvData();
    }
}, 5000);

$('#saveCv').on('click', (event) => {
    cv.removeAttribute('contenteditable');
    const cvData = cv.innerHTML;

    fetch('https://cv-buddy-six.vercel.app/saveCv', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: cvData })
    }).then(response => response.json())
        .then(data => {
            console.log(data.message);
        })
        .catch(error => console.error('Error saving CV data:', error));
});

$('#resetCv').on('click', (event) => {
    localStorage.removeItem('iitkgpCvData');
    location.reload();
});
