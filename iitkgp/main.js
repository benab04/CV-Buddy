function fetchCVList(preserveSelection = false) {
    const currentSelection = $('#cvSelect').val(); // Store current selection

    fetch('https://cv-buddy-six.vercel.app/getCvList')
        .then(response => response.json())
        .then(data => {
            if (data && data.cvList) {
                const select = document.getElementById('cvSelect');
                select.innerHTML = '<option value="">Select CV</option>';
                data.cvList.forEach(cv => {
                    const option = document.createElement('option');
                    option.value = cv.id;
                    option.textContent = cv.name || `CV #${cv.id}`;
                    select.appendChild(option);
                });

                // Restore the previous selection if requested
                if (preserveSelection && currentSelection) {
                    select.value = currentSelection;
                }
            }
        })
        .catch(error => console.error('Error fetching CV list:', error));
}

function initCv(cvId) {
    fetch(`https://cv-buddy-six.vercel.app/getCv/${cvId}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.data) {
                let cvData = JSON.parse(data.data);
                console.log(cvData);
                if (cvData)
                    cv.innerHTML = cvData.data;
            }
        })
        .catch(error => console.error('Error fetching CV data:', error));
}

// Fetch CV list when page loads
$(document).ready(() => {
    fetchCVList();
});

// Handle CV selection
$('#cvSelect').on('change', function () {
    const selectedCvId = $(this).val();
    if (selectedCvId) {
        initCv(selectedCvId);
    }
});

// Handle new CV creation
$('#newCV').on('click', () => {
    $('#cvNameModal').modal('show');
});

$('#createCvButton').on('click', () => {
    const cvName = $('#cvName').val().trim();
    if (!cvName) {
        alert('Please enter a name for your CV');
        return;
    }

    fetch('https://cv-buddy-six.vercel.app/createCv', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: cv.innerHTML,
            name: cvName
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log('New CV created:', data);
            fetchCVList(); // Refresh the CV list
            if (data.id) {
                $('#cvSelect').val(data.id); // Select the newly created CV
            }
            $('#cvNameModal').modal('hide'); // Hide the modal
            $('#cvName').val(''); // Clear the input
        })
        .catch(error => console.error('Error creating new CV:', error));
});


function saveCvData() {
    const cvData = cv.innerHTML;
    const selectedCvId = $('#cvSelect').val();

    if (!selectedCvId) {
        console.error('No CV selected');
        return;
    }

    fetch('https://cv-buddy-six.vercel.app/saveCv', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: selectedCvId,
            data: cvData
        })
    }).then(response => response.json())
        .then(data => {
            console.log(data.message);
            fetchCVList(true); // Refresh the list while preserving selection
        })
        .catch(error => console.error('Error saving CV data:', error));
}

let lastCvData = cv.innerHTML;
let lastCvId = '';
setInterval(() => {
    const currentCvData = cv.innerHTML;
    const currentCvId = $('#cvSelect').val();

    if (currentCvId && // Make sure a CV is selected
        currentCvId === lastCvId && // Only save if we're still on the same CV
        currentCvData !== lastCvData &&
        $('#toggleAutoSave').text() !== "Enable Autosave" &&
        $('#toggleAutoSave').length) {
        lastCvData = currentCvData;
        saveCvData();
    }
    lastCvId = currentCvId; // Update the last CV ID
}, 5000);

$('#saveCv').on('click', (event) => {
    cv.removeAttribute('contenteditable');
    const cvData = cv.innerHTML;
    const selectedCvId = $('#cvSelect').val();

    if (!selectedCvId) {
        alert('Please select a CV first');
        return;
    }

    fetch('https://cv-buddy-six.vercel.app/saveCv', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: selectedCvId,
            data: cvData
        })
    }).then(response => response.json())
        .then(data => {
            console.log(data.message);
            fetchCVList(true); // Refresh the list while preserving selection
        })
        .catch(error => console.error('Error saving CV data:', error));
});

$('#resetCv').on('click', (event) => {
    localStorage.removeItem('iitkgpCvData');
    location.reload();
});
