$(document).ready(function () {
    // AJAX call to fetch the fact
    $.ajax({
        url: 'http://numbersapi.com/1/30/date?json',
        method: 'GET',
        success: function (data) {
            $('#fact-text').text(data.text);
        },
        error: function () {
            $('#fact-text').text('Failed to load fact.');
        }
    });

    // Drag and Drop Functionality
    const dropArea = $('#drop-area');
    const fileInput = $('#file-input');
    const uploadButton = $('#upload-button');

    // Handle dragover event
    dropArea.on('dragover', (e) => {
        e.preventDefault();
        dropArea.addClass('bg-light');
    });

    // Handle dragleave event
    dropArea.on('dragleave', () => {
        dropArea.removeClass('bg-light');
    });

    // Handle drop event
    dropArea.on('drop', (e) => {
        e.preventDefault();
        dropArea.removeClass('bg-light');
        const files = e.originalEvent.dataTransfer.files;
        const imageFiles = filterImages(files);
        if (imageFiles.length > 0) {
            uploadFiles(imageFiles);
        } else {
            alert('Please upload only image files.');
        }
    });

    // Handle button click event to trigger file input
    uploadButton.on('click', (e) => {
        e.preventDefault();
        fileInput.trigger('click');
    });

    // Handle file input change event
    fileInput.on('change', (e) => {
        const files = e.target.files;
        const imageFiles = filterImages(files);
        if (imageFiles.length > 0) {
            uploadFiles(imageFiles);
        } else {
            alert('Please select only image files.');
            fileInput.val(''); // Reset file input if invalid files are selected
        }
    });

    // Function to filter image files
    function filterImages(files) {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        return Array.from(files).filter(file => validImageTypes.includes(file.type));
    }

    // Function to upload files
    function uploadFiles(files) {
        const formData = new FormData();
        for (let file of files) {
            formData.append('images', file);
        }

        $.ajax({
            url: 'http://localhost:3000/upload',
            method: 'POST',
            processData: false,
            contentType: false,
            data: formData,
            success: function () {
                alert('File uploaded successfully!');
            },
            error: function (xhr) {
                console.error('Upload error:', xhr.status, xhr.statusText);
                alert(`Error uploading files: ${xhr.status} - ${xhr.statusText}`);
            }
        });
    }
});