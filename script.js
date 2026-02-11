document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('invitationForm');
    const addQuestionBtn = document.getElementById('addQuestion');
    const questionsContainer = document.getElementById('questionsContainer');
    const photoContainer = document.getElementById('photoContainer');
    const linkOutput = document.getElementById('linkOutput');
    const invitationLink = document.getElementById('invitationLink');
    const copyLinkBtn = document.getElementById('copyLink');

    const MAX_PHOTOS = 4;

    // Upload photo to server and return photo ID
    async function uploadPhotoToServer(file) {
        try {
            const formData = new FormData();
            formData.append('photo', file);
            
            const response = await fetch('/api/upload-photo', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error('Failed to upload photo');
            
            const result = await response.json();
            return result.photoId;
        } catch (error) {
            throw new Error('Error uploading photo: ' + error.message);
        }
    }

    // Add question functionality
    addQuestionBtn.addEventListener('click', () => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.innerHTML = `
            <input type="text" class="question" placeholder="Enter a question" required>
            <button type="button" class="remove-question">Remove</button>
        `;
        questionsContainer.appendChild(questionItem);
        attachRemoveListener(questionItem.querySelector('.remove-question'));
    });

    const photosInput = document.getElementById('photosInput');
    const photoPreview = document.getElementById('photoPreview');

    // Handle multi-file selection and preview
    photosInput.addEventListener('change', () => {
        photoPreview.innerHTML = '';
        const files = Array.from(photosInput.files || []).slice(0, MAX_PHOTOS);
        if (files.length > MAX_PHOTOS) {
            alert(`Maximum ${MAX_PHOTOS} photos allowed. Extra files will be ignored.`);
        }
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = document.createElement('img');
                img.src = reader.result;
                img.alt = `Preview ${index + 1}`;
                img.className = 'preview-thumb';
                photoPreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });

    // Attach remove listener to existing and new remove buttons
    function attachRemoveListener(btn) {
        btn.addEventListener('click', (e) => {
            e.target.parentElement.remove();
        });
    }
    function attachPhotoRemoveListener(btn) {
        btn.addEventListener('click', (e) => {
            e.target.parentElement.remove();
            updatePhotoRemoveButtons();
        });
    }
    function updatePhotoRemoveButtons() {
        const photoItems = photoContainer.querySelectorAll('.photo-item');
        photoItems.forEach(item => {
            const removeBtn = item.querySelector('.remove-photo');
            removeBtn.style.display = photoItems.length > 1 ? 'block' : 'none';
        });
    }

    document.querySelectorAll('.remove-question').forEach(attachRemoveListener);

    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const partnerName = document.getElementById('partnerName').value;
        const files = Array.from(photosInput.files || []).slice(0, MAX_PHOTOS);
        const questions = Array.from(questionsContainer.querySelectorAll('.question')).map(q => q.value).filter(q => q.trim());

        if (files.length === 0 || questions.length === 0) {
            alert('Please fill all fields (at least 1 photo and 1 question).');
            return;
        }

        // Show loading message
        const submitBtn = form.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating...';

        try {
            // Step 1: Upload photos to server
            const photoIds = [];
            for (const file of files) {
                const photoId = await uploadPhotoToServer(file);
                photoIds.push(photoId);
            }

            // Step 2: Create invitation on server
            const invitationData = {
                name: partnerName,
                photoIds: photoIds,
                questions: questions
            };
            
            const response = await fetch('/api/create-invitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invitationData)
            });
            
            if (!response.ok) throw new Error('Failed to create invitation');
            
            const result = await response.json();
            const token = result.token;
            
            // Step 3: Create shareable link with token
            const fullLink = `${window.location.origin}${window.location.pathname.replace('index.html', '')}invite.html?token=${token}`;
            invitationLink.value = fullLink;
            linkOutput.style.display = 'block';

        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generate Invitation Link';
        }
    });

    // Copy link
    copyLinkBtn.addEventListener('click', () => {
        invitationLink.select();
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    });
});