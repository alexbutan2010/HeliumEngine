document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    const uploadStatus = document.getElementById('uploadStatus');
    const fileInputs = {
        html: document.getElementById('htmlFile'),
        css: document.getElementById('cssFile'),
        js: document.getElementById('jsFile')
    };
    const checkboxes = {
        html: document.getElementById('includeHtml'),
        css: document.getElementById('includeCss'),
        js: document.getElementById('includeJs')
    };

    // Initialize file input states based on checkboxes
    Object.keys(checkboxes).forEach(type => {
        const checkbox = checkboxes[type];
        const fileInput = fileInputs[type];
        
        checkbox.addEventListener('change', () => {
            fileInput.disabled = !checkbox.checked;
            if (!checkbox.checked) {
                fileInput.value = '';
            }
        });

        // Set initial state
        fileInput.disabled = !checkbox.checked;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous status
        uploadStatus.className = 'upload-status';
        uploadStatus.textContent = '';
        
        // Create FormData
        const formData = new FormData();
        let hasFiles = false;

        // Add files based on checkbox states
        Object.keys(checkboxes).forEach(type => {
            const checkbox = checkboxes[type];
            const fileInput = fileInputs[type];
            
            if (checkbox.checked && fileInput.files.length > 0) {
                formData.append(type, fileInput.files[0]);
                hasFiles = true;
            }
        });

        if (!hasFiles) {
            showError('Please select at least one file to upload');
            return;
        }

        try {
            // Show loading state
            uploadStatus.textContent = 'Uploading files...';
            uploadStatus.style.display = 'block';

            // Simulate upload (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success message
            showSuccess('Files uploaded successfully!');
            
            // Reset form
            form.reset();
            
            // Reset file input states
            Object.keys(checkboxes).forEach(type => {
                fileInputs[type].disabled = !checkboxes[type].checked;
            });
        } catch (error) {
            showError('Error uploading files. Please try again.');
            console.error('Upload error:', error);
        }
    });

    // Handle form reset
    form.addEventListener('reset', () => {
        uploadStatus.className = 'upload-status';
        uploadStatus.textContent = '';
        uploadStatus.style.display = 'none';
        
        // Reset file input states
        Object.keys(checkboxes).forEach(type => {
            fileInputs[type].disabled = !checkboxes[type].checked;
        });
    });

    function showError(message) {
        uploadStatus.className = 'upload-status error';
        uploadStatus.textContent = message;
        uploadStatus.style.display = 'block';
    }

    function showSuccess(message) {
        uploadStatus.className = 'upload-status success';
        uploadStatus.textContent = message;
        uploadStatus.style.display = 'block';
    }
}); 