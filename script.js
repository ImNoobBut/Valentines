document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('invitationForm');
    const addQuestionBtn = document.getElementById('addQuestion');
    const questionsContainer = document.getElementById('questionsContainer');
    const photoContainer = document.getElementById('photoContainer');
    const linkOutput = document.getElementById('linkOutput');
    const invitationLink = document.getElementById('invitationLink');
    const copyLinkBtn = document.getElementById('copyLink');

    const MAX_PHOTOS = 4;

    // Compress and convert image to base64
    function compressImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const maxSize = 300;
                    let { width, height } = img;
                    if (width > height) {
                        if (width > maxSize) {
                            height = (height * maxSize) / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = (width * maxSize) / height;
                            height = maxSize;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.75));
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Upload photo to server and return photo ID
    async function uploadPhotoToServer(photoData) {
        try {
            const response = await fetch('/api/upload-photo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/octet-stream' },
                body: atob(photoData.split(',')[1]) // Send just the image bytes
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

        // Compress all photos
        const compressedPhotos = await Promise.all(files.map(compressImage));

        const params = new URLSearchParams({
            name: partnerName,
            photos: JSON.stringify(compressedPhotos),
            questions: JSON.stringify(questions)
        });
        const link = `${window.location.origin}/Valentines/invite.html?${params.toString()}`;
        invitationLink.value = link;
        linkOutput.style.display = 'block';
    });

    // Copy link
    copyLinkBtn.addEventListener('click', () => {
        invitationLink.select();
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    });
});