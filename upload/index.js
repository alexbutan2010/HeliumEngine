document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    const folderInput = document.getElementById('folderInput');
    const uploadStatus = document.getElementById('uploadStatus');
    const fileList = document.getElementById('fileList');

    // Handle folder selection
    folderInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        displayFileList(files);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous status
        uploadStatus.className = 'upload-status';
        uploadStatus.textContent = '';
        
        const files = Array.from(folderInput.files);
        
        if (files.length === 0) {
            showError('Please select a website folder to upload');
            return;
        }

        // Validate website files
        const validation = validateWebsiteFiles(files);
        if (!validation.isValid) {
            showError(validation.message);
            return;
        }

        try {
            // Show loading state
            uploadStatus.textContent = 'Uploading website...';
            uploadStatus.style.display = 'block';

            // Create FormData
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files[]', file, file.webkitRelativePath);
            });

            // Simulate upload (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success message
            showSuccess('Website uploaded successfully!');
            
            // Reset form
            form.reset();
            fileList.className = 'file-list';
            
        } catch (error) {
            showError('Error uploading website. Please try again.');
            console.error('Upload error:', error);
        }
    });

    // Handle form reset
    form.addEventListener('reset', () => {
        uploadStatus.className = 'upload-status';
        uploadStatus.textContent = '';
        uploadStatus.style.display = 'none';
        fileList.className = 'file-list';
    });

    function validateWebsiteFiles(files) {
        const htmlFiles = files.filter(file => file.name.endsWith('.html'));
        const cssFiles = files.filter(file => file.name.endsWith('.css'));
        const jsFiles = files.filter(file => file.name.endsWith('.js'));

        if (htmlFiles.length === 0 && cssFiles.length === 0 && jsFiles.length === 0) {
            return {
                isValid: false,
                message: 'No website files found. Please include at least one HTML, CSS, or JavaScript file.'
            };
        }

        return { isValid: true };
    }

    function displayFileList(files) {
        const htmlFiles = files.filter(file => file.name.endsWith('.html'));
        const cssFiles = files.filter(file => file.name.endsWith('.css'));
        const jsFiles = files.filter(file => file.name.endsWith('.js'));
        const otherFiles = files.filter(file => 
            !file.name.endsWith('.html') && 
            !file.name.endsWith('.css') && 
            !file.name.endsWith('.js')
        );

        let html = '<h3>Selected Files</h3><ul>';
        
        if (htmlFiles.length > 0) {
            html += '<li class="file-type-header">HTML Files</li>';
            htmlFiles.forEach(file => {
                html += `<li><span class="file-icon html">📄</span>${file.name}</li>`;
            });
        }

        if (cssFiles.length > 0) {
            html += '<li class="file-type-header">CSS Files</li>';
            cssFiles.forEach(file => {
                html += `<li><span class="file-icon css">📄</span>${file.name}</li>`;
            });
        }

        if (jsFiles.length > 0) {
            html += '<li class="file-type-header">JavaScript Files</li>';
            jsFiles.forEach(file => {
                html += `<li><span class="file-icon js">📄</span>${file.name}</li>`;
            });
        }

        if (otherFiles.length > 0) {
            html += '<li class="file-type-header">Other Files</li>';
            otherFiles.forEach(file => {
                html += `<li><span class="file-icon other">📄</span>${file.name}</li>`;
            });
        }

        html += '</ul>';
        fileList.innerHTML = html;
        fileList.className = 'file-list visible';
    }

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