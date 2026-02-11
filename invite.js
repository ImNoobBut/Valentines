document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const partnerName = urlParams.get('name');
    const photoData = urlParams.get('photo');
    const questions = JSON.parse(urlParams.get('questions') || '[]');

    if (!partnerName || !photoData || questions.length === 0) {
        document.body.innerHTML = '<h1>Invalid invitation link.</h1>';
        return;
    }

    const partnerNameDisplay = document.getElementById('partnerNameDisplay');
    const greetingPage = document.getElementById('greetingPage');
    const questionPage = document.getElementById('questionPage');
    const finalPage = document.getElementById('finalPage');
    const questionText = document.getElementById('questionText');
    const yesButton = document.getElementById('yesButton');
    const noButton = document.getElementById('noButton');
    const hoverPhoto = document.getElementById('hoverPhoto');
    const finalMessage = document.getElementById('finalMessage');

    partnerNameDisplay.textContent = partnerName;
    hoverPhoto.src = photoData;

    let currentQuestionIndex = 0;

    // Greeting page next
    document.getElementById('nextToQuestions').addEventListener('click', () => {
        greetingPage.style.display = 'none';
        showQuestion();
    });

    function showQuestion() {
        if (currentQuestionIndex < questions.length) {
            questionText.textContent = questions[currentQuestionIndex];
            questionPage.style.display = 'block';
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
    function moveNoButton() {
        const container = document.querySelector('.container');
        const rect = container.getBoundingClientRect();
        const buttonRect = noButton.getBoundingClientRect();
        const newX = Math.random() * (rect.width - buttonRect.width);
        const newY = Math.random() * (rect.height - buttonRect.height);
        noButton.style.position = 'absolute';
        noButton.style.left = `${newX}px`;
        noButton.style.top = `${newY}px`;
    }

    // Desktop: on mouseover
    noButton.addEventListener('mouseover', moveNoButton);

    // Mobile: on click
    noButton.addEventListener('click', (e) => {
        e.preventDefault();
        moveNoButton();
    });
});