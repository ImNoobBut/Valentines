document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        document.body.innerHTML = '<h1>Invalid invitation link.</h1>';
        return;
    }

    try {
        // Fetch invitation data from server
        const response = await fetch(`/api/invitation/${token}`);
        if (!response.ok) throw new Error('Invitation not found');
        
        const invitationData = await response.json();
        const partnerName = invitationData.name;
        const photoIds = invitationData.photoIds || [];
        const questions = invitationData.questions || [];

        if (!partnerName || photoIds.length === 0 || questions.length === 0) {
            document.body.innerHTML = '<h1>Invalid invitation data.</h1>';
            return;
        }

        const partnerNameDisplay = document.getElementById('partnerNameDisplay');
        const greetingPage = document.getElementById('greetingPage');
        const questionPage = document.getElementById('questionPage');
        const finalPage = document.getElementById('finalPage');
        const questionText = document.getElementById('questionText');
        const yesButton = document.getElementById('yesButton');
        const noButton = document.getElementById('noButton');
        const photosGrid = document.getElementById('photosGrid');
        const finalMessage = document.getElementById('finalMessage');

        // Container for positioning calculations
        const container = document.querySelector('.container');

        // Ensure container is a positioned ancestor for absolute placement
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }

        // Keep track of initial position for the No button (relative to container)
        const NO_RETURN_DELAY = 5000; // ms
        let noReturnTimer = null;
        let initialNoPos = null;

        function setNoInitialPositionNextToYes() {
            const buttonsWrapper = document.querySelector('.buttons-wrapper');
            if (!buttonsWrapper) return; // Ensure wrapper exists

            const wRect = buttonsWrapper.getBoundingClientRect();
            const yesRect = yesButton.getBoundingClientRect();
            const noRect = noButton.getBoundingClientRect();

            // Read gap from CSS variable --no-gap (fallback to 12px)
            const gapValue = getComputedStyle(container).getPropertyValue('--no-gap') || '12px';
            const gap = parseFloat(gapValue) || 12;

            // Default: position to the right of Yes button, vertically centered within the wrapper
            let left = (yesRect.right - wRect.left) + gap;
            let top = (wRect.height - noRect.height) / 2; // Center vertically within wrapper

            // If placing to the right would overflow horizontally, place to the left of Yes
            if (left + noRect.width > wRect.width) {
                left = (yesRect.left - wRect.left) - noRect.width - gap;
            }

            // Clamp to wrapper bounds
            left = Math.max(0, Math.min(left, Math.max(0, wRect.width - noRect.width)));
            top = Math.max(0, Math.min(top, Math.max(0, wRect.height - noRect.height)));

            initialNoPos = { left, top };

            noButton.style.position = 'absolute';
            noButton.style.left = initialNoPos.left + 'px';
            noButton.style.top = initialNoPos.top + 'px';
            noButton.style.transition = 'left 0.2s ease, top 0.2s ease';
        }

        partnerNameDisplay.textContent = partnerName;

        // Display photos from server using photo IDs
        for (let i = 0; i < photoIds.length; i++) {
            const img = document.createElement('img');
            img.src = `/api/photo/${photoIds[i]}`;
            img.alt = `Photo ${i + 1}`;
            img.className = `floating-photo floating-photo-${i + 1}`;
            photosGrid.appendChild(img);
        }

        let currentQuestionIndex = 0;

        // Greeting page next button
        document.getElementById('nextToQuestions').addEventListener('click', () => {
            greetingPage.style.display = 'none';
            showQuestion();
        });

        function showQuestion() {
            if (currentQuestionIndex < questions.length) {
                questionText.textContent = questions[currentQuestionIndex];
                questionPage.style.display = 'block';
                // Set No button initial position after the question is shown and layout settles
                requestAnimationFrame(setNoInitialPositionNextToYes);
            } else {
                showFinal();
            }
        }

        function showFinal() {
            questionPage.style.display = 'none';
            finalPage.style.display = 'block';
            finalMessage.textContent = `I hope you enjoyed this little journey. Will you be my Valentine, ${partnerName}?`;
        }

        // Yes button
        yesButton.addEventListener('click', () => {
            currentQuestionIndex++;
            showQuestion();
        });

        // No button - run away
        function scheduleReturn() {
            if (noReturnTimer) clearTimeout(noReturnTimer);
            noReturnTimer = setTimeout(() => {
                // Return to initial captured position
                if (initialNoPos) {
                    noButton.style.left = (10 + initialNoPos.left) + 'px';
                    noButton.style.top = initialNoPos.top + 'px';
                    // Briefly wiggle/flash to draw attention
                    noButton.classList.remove('no-return-effect');
                    // Force reflow to restart the animation if it was recently used
                    // eslint-disable-next-line no-unused-expressions
                    void noButton.offsetWidth;
                    noButton.classList.add('no-return-effect');
                    // Remove effect after animation completes to keep DOM clean
                    setTimeout(() => noButton.classList.remove('no-return-effect'), 700);
                }
            }, NO_RETURN_DELAY);
        }

        function moveNoButton() {
            // Calculate random X and Y coordinates within the container boundaries
            const containerRect = container.getBoundingClientRect();
            const buttonRect = noButton.getBoundingClientRect();

            // Ensure the button stays within the visible area
            const maxX = Math.max(0, containerRect.width - buttonRect.width);
            const maxY = Math.max(0, containerRect.height - buttonRect.height);

            const newX = Math.random() * maxX;
            const newY = Math.random() * maxY;

            // Apply the new position using absolute positioning
            noButton.style.left = `${newX}px`;
            noButton.style.top = `${newY}px`;

            // reset and start timer to return to initial position if left unattended
            scheduleReturn();
        }

        // Add event listener for when the mouse enters the 'No' button area
        noButton.addEventListener('mouseenter', moveNoButton);
        noButton.addEventListener('click', (e) => {
            e.preventDefault();
            moveNoButton();
        });

        // If the user focuses away or interaction ends, ensure timer is running
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') scheduleReturn();
        });

        // Recalculate default No button position on window resize (if question page visible)
        window.addEventListener('resize', () => {
            // Only recalc when question page is visible
            if (questionPage.style.display !== 'none') {
                requestAnimationFrame(setNoInitialPositionNextToYes);
            }
        });

        // Show greeting page initially
        greetingPage.style.display = 'block';
    } catch (error) {
        console.error('Error loading invitation:', error);
        document.body.innerHTML = '<h1>Error loading invitation.</h1>';
    }
});