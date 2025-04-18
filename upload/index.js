document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    const domainInput = document.getElementById('domainName');
    const folderInput = document.getElementById('folderInput');
    const uploadStatus = document.getElementById('uploadStatus');
    const fileList = document.getElementById('fileList');

    // Get GitHub token from localStorage or prompt user
    function getGitHubToken() {
        let token = localStorage.getItem('github_token');
        if (!token) {
            token = prompt('Please enter your GitHub access token:');
            if (token) {
                localStorage.setItem('github_token', token);
            }
        }
        return token;
    }

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
        
        // Get domain name
        const domain = domainInput.value.trim();
        if (!domain) {
            showError('Please enter a domain name');
            return;
        }

        if (!/^[a-zA-Z0-9-]+$/.test(domain)) {
            showError('Domain name can only contain letters, numbers, and hyphens');
            return;
        }

        // Get selected files
        const files = Array.from(folderInput.files);
        if (files.length === 0) {
            showError('Please select a website folder to upload');
            return;
        }

        // Get GitHub token
        const token = getGitHubToken();
        if (!token) {
            showError('GitHub access token is required to upload files');
            return;
        }

        // Filter for only HTML, CSS, and JS files
        const htmlFiles = files.filter(file => file.name.endsWith('.html'));
        const cssFiles = files.filter(file => file.name.endsWith('.css'));
        const jsFiles = files.filter(file => file.name.endsWith('.js'));

        if (htmlFiles.length === 0 && cssFiles.length === 0 && jsFiles.length === 0) {
            showError('No website files found. Please include at least one HTML, CSS, or JavaScript file.');
            return;
        }

        try {
            // Show loading state
            uploadStatus.textContent = 'Preparing files for upload...';
            uploadStatus.style.display = 'block';

            // Read the core web files
            const fileContents = {};
            const coreSiteFiles = [...htmlFiles, ...cssFiles, ...jsFiles];

            for (const file of coreSiteFiles) {
                const reader = new FileReader();
                await new Promise((resolve, reject) => {
                    reader.onload = () => {
                        // Get just the filename without any path
                        const fileName = file.name.split('/').pop();
                        fileContents[fileName] = reader.result;
                        resolve();
                    };
                    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
                    reader.readAsText(file);
                });
            }

            // Update status
            uploadStatus.textContent = 'Creating repository structure...';

            // Repository details
            const owner = 'OxygenWebsite';
            const repo = 'websites';
            const branch = 'main';
            const basePath = domain; // Just the domain name as the folder

            // Get the latest commit SHA
            const latestCommitResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!latestCommitResponse.ok) {
                throw new Error('Failed to get repository information');
            }

            const latestCommitData = await latestCommitResponse.json();
            const latestCommitSha = latestCommitData.object.sha;

            // Create blobs for each file
            const fileBlobs = [];
            for (const [fileName, content] of Object.entries(fileContents)) {
                const blobResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: btoa(content),
                        encoding: 'base64'
                    })
                });

                if (!blobResponse.ok) {
                    throw new Error(`Failed to create blob for ${fileName}`);
                }

                const blobData = await blobResponse.json();
                fileBlobs.push({
                    path: `${basePath}/${fileName}`,
                    mode: '100644',
                    type: 'blob',
                    sha: blobData.sha
                });
            }

            // Create a new tree
            const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    base_tree: latestCommitSha,
                    tree: fileBlobs
                })
            });

            if (!treeResponse.ok) {
                throw new Error('Failed to create tree');
            }

            const treeData = await treeResponse.json();

            // Create a commit
            uploadStatus.textContent = 'Committing changes...';
            const commitResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Add website: ${domain}`,
                    tree: treeData.sha,
                    parents: [latestCommitSha]
                })
            });

            if (!commitResponse.ok) {
                throw new Error('Failed to create commit');
            }

            const commitData = await commitResponse.json();

            // Update the reference
            const updateRefResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sha: commitData.sha,
                    force: false
                })
            });

            if (!updateRefResponse.ok) {
                throw new Error('Failed to update branch reference');
            }

            showSuccess(`Website uploaded successfully! Your site will be available at: ${domain}.he after indexing`);
            form.reset();
            fileList.className = 'file-list';

        } catch (error) {
            console.error('Upload error:', error);
            showError(`Failed to upload website: ${error.message}`);
        }
    });

    // Handle form reset
    form.addEventListener('reset', () => {
        uploadStatus.className = 'upload-status';
        uploadStatus.textContent = '';
        uploadStatus.style.display = 'none';
        fileList.className = 'file-list';
    });

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
            html += '<li class="file-type-header">HTML Files (will be uploaded)</li>';
            htmlFiles.forEach(file => {
                html += `<li><span class="file-icon html">📄</span>${file.name}</li>`;
            });
        }

        if (cssFiles.length > 0) {
            html += '<li class="file-type-header">CSS Files (will be uploaded)</li>';
            cssFiles.forEach(file => {
                html += `<li><span class="file-icon css">📄</span>${file.name}</li>`;
            });
        }

        if (jsFiles.length > 0) {
            html += '<li class="file-type-header">JavaScript Files (will be uploaded)</li>';
            jsFiles.forEach(file => {
                html += `<li><span class="file-icon js">📄</span>${file.name}</li>`;
            });
        }

        if (otherFiles.length > 0) {
            html += '<li class="file-type-header">Other Files (will not be uploaded)</li>';
            otherFiles.forEach(file => {
                html += `<li class="ignored"><span class="file-icon other">📄</span>${file.name}</li>`;
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