document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    const domainInput = document.getElementById('domainName');
    const folderInput = document.getElementById('folderInput');
    const uploadStatus = document.getElementById('uploadStatus');
    const fileList = document.getElementById('fileList');

    // Get access token from localStorage or prompt user
    function getAccessToken() {
        let token = localStorage.getItem('helium_access_token');
        if (!token) {
            token = prompt('Please enter your Helium access token:');
            if (token) {
                localStorage.setItem('helium_access_token', token);
            }
        }
        return token;
    }

    // Handle folder selection
    folderInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        console.log('Selected files:', files);
        displayFileList(files);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous status
        uploadStatus.className = 'upload-status';
        uploadStatus.textContent = '';
        
        // Validate domain name
        const domain = domainInput.value.trim();
        if (!domain) {
            showError('Please enter a domain name');
            return;
        }

        if (!/^[a-zA-Z0-9-]+$/.test(domain)) {
            showError('Domain name can only contain letters, numbers, and hyphens');
            return;
        }

        const files = Array.from(folderInput.files);
        console.log('Files to upload:', files);
        
        if (files.length === 0) {
            showError('Please select a website folder to upload');
            return;
        }

        // Get access token
        const token = getAccessToken();
        if (!token) {
            showError('Access token is required to upload files');
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
            uploadStatus.textContent = 'Creating website folder and uploading files...';
            uploadStatus.style.display = 'block';

            // Create FormData with domain and files
            const formData = new FormData();
            formData.append('domain', domain);
            
            // Add files with their relative paths
            files.forEach(file => {
                const filePath = file.webkitRelativePath || file.name;
                formData.append('files[]', file, filePath);
            });

            // Use window.helium.upload if available
            if (window.helium && typeof window.helium.upload === 'function') {
                try {
                    const result = await window.helium.upload(domain, formData);
                    if (result.success) {
                        showSuccess(`Website uploaded successfully! Your site is now available at: ${domain}.he`);
                        form.reset();
                        fileList.className = 'file-list';
                    } else {
                        throw new Error(result.error || 'Upload failed');
                    }
                } catch (error) {
                    throw new Error(`Helium upload failed: ${error.message}`);
                }
            } else {
                // Fallback to XMLHttpRequest with he:// protocol
                const uploadUrl = `he://upload.he/${domain}`;
                await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', uploadUrl, true);
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    
                    xhr.onload = function() {
                        if (xhr.status === 200) {
                            try {
                                const result = JSON.parse(xhr.responseText);
                                if (result.success) {
                                    showSuccess(`Website uploaded successfully! Your site is now available at: ${domain}.he`);
                                    form.reset();
                                    fileList.className = 'file-list';
                                    resolve();
                                } else {
                                    reject(new Error(result.error || 'Upload failed'));
                                }
                            } catch (error) {
                                reject(new Error(`Error processing response: ${error.message}`));
                            }
                        } else {
                            if (xhr.status === 401) {
                                localStorage.removeItem('helium_access_token');
                                reject(new Error('Access token is invalid or expired. Please enter a new token.'));
                            } else {
                                reject(new Error(`Upload failed: ${xhr.statusText}`));
                            }
                        }
                    };

                    xhr.onerror = function() {
                        reject(new Error('Network error occurred while uploading'));
                    };

                    xhr.send(formData);
                });
            }
        } catch (error) {
            console.error('Full error details:', error);
            showError(`Error uploading website: ${error.message}`);
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

        console.log('File validation:', {
            htmlFiles: htmlFiles.length,
            cssFiles: cssFiles.length,
            jsFiles: jsFiles.length,
            totalFiles: files.length
        });

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
        console.error('Error:', message);
        uploadStatus.className = 'upload-status error';
        uploadStatus.textContent = message;
        uploadStatus.style.display = 'block';
    }

    function showSuccess(message) {
        console.log('Success:', message);
        uploadStatus.className = 'upload-status success';
        uploadStatus.textContent = message;
        uploadStatus.style.display = 'block';
    }
}); 
