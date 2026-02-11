document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('invitationForm');
    const addQuestionBtn = document.getElementById('addQuestion');
    const questionsContainer = document.getElementById('questionsContainer');
    const linkOutput = document.getElementById('linkOutput');
    const invitationLink = document.getElementById('invitationLink');
    const copyLinkBtn = document.getElementById('copyLink');

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

    // Attach remove listener to existing and new remove buttons
    function attachRemoveListener(btn) {
        btn.addEventListener('click', (e) => {
            e.target.parentElement.remove();
        });
    }
    document.querySelectorAll('.remove-question').forEach(attachRemoveListener);

    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const partnerName = document.getElementById('partnerName').value;
        const photoFile = document.getElementById('photo').files[0];
        const questions = Array.from(document.querySelectorAll('.question')).map(q => q.value).filter(q => q.trim());

        if (!photoFile || questions.length === 0) {
            alert('Please fill all fields.');
            return;
        }

        // Convert photo to base64 with compression
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
                const photoData = canvas.toDataURL('image/jpeg', 0.8);
                const params = new URLSearchParams({
                    name: partnerName,
                    photo: photoData,
                    questions: JSON.stringify(questions)
                });
                const link = `${window.location.origin}/invite.html?${params.toString()}`;
                invitationLink.value = link;
                linkOutput.style.display = 'block';
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(photoFile);
    });

    // Copy link
    copyLinkBtn.addEventListener('click', () => {
        invitationLink.select();
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    });
});