// --- Global State and Utility Functions ---
let currentView = 'home-section'; // Tracks the currently active section
let userName = '';
let quizzes = []; // Stores quizzes loaded from localStorage
let currentQuiz = null; // Quiz being taken
let userAnswers = []; // Answers for the current quiz taking session
let quizHistory = []; // Stores past quiz results
let selectedCategories = new Set(); // Stores selected quiz categories

let miniTestState = {
    countdown: 0,
    testStarted: false,
    currentQuestionIndex: 0,
    score: 0,
    testCompleted: false,
    selectedAnswer: null,
};

const quizQuestionsTemplate = { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 };

const categoryDescriptions = {
    "Math": "Challenge your numerical aptitude! Quizzes on algebra, geometry, calculus, and basic arithmetic. Perfect for students and enthusiasts alike.",
    "Science": "Explore the wonders of the natural world. Dive into biology, chemistry, physics, and environmental science with these engaging quizzes.",
    "History": "Journey through time! Test your knowledge on ancient civilizations, world wars, famous figures, and pivotal moments in human history.",
    "Programming": "Code your way to success! Quizzes on fundamental programming concepts, specific languages like Python/JavaScript, algorithms, and data structures.",
    "General Knowledge": "Broaden your horizons! A mix of questions from various fields including current events, geography, literature, and pop culture.",
    "All": "Browse all available quizzes across every category. Discover new topics and challenge yourself without limits!"
};

// --- DOM Elements ---
const homeSection = document.getElementById('home-section');
const createQuizSection = document.getElementById('create-quiz-section');
const quizListingSection = document.getElementById('quiz-listing-section');
const quizTakingSection = document.getElementById('quiz-taking-section');
const quizResultsSection = document.getElementById('quiz-results-section');
const miniTestSection = document.getElementById('mini-test-section');
const contactUsSection = document.getElementById('contact-us-section');

const sections = [
    homeSection,
    createQuizSection,
    quizListingSection,
    quizTakingSection,
    quizResultsSection,
    miniTestSection,
    contactUsSection
];

// Header Buttons
document.querySelector('nav a[href="#home-section"]').addEventListener('click', (e) => { e.preventDefault(); navigateTo('home-section'); });
document.querySelector('nav a[href="#create-quiz-section"]').addEventListener('click', (e) => { e.preventDefault(); navigateTo('create-quiz-section'); });
document.querySelector('nav a[href="#quiz-listing-section"]').addEventListener('click', (e) => { e.preventDefault(); navigateTo('quiz-listing-section'); });
document.querySelector('nav a[href="#contact-us-section"]').addEventListener('click', (e) => { e.preventDefault(); navigateTo('contact-us-section'); });
document.getElementById('loginRegisterBtn').addEventListener('click', () => showMessageBox("Login/Register functionality coming soon!", "info"));
document.getElementById('newQuizBtn').addEventListener('click', () => navigateTo('create-quiz-section'));

// Home Page Buttons
document.getElementById('homeCreateQuizBtn').addEventListener('click', () => navigateTo('create-quiz-section'));
document.getElementById('homeTakeQuizBtn').addEventListener('click', () => navigateTo('quiz-listing-section'));
document.getElementById('homeMiniTestBtn').addEventListener('click', () => navigateTo('mini-test-section'));

// Quiz Creation Elements
const quizTitleInput = document.getElementById('quizTitle');
const quizCategoryInput = document.getElementById('quizCategory');
const quizDescriptionInput = document.getElementById('quizDescription');
const questionsContainer = document.getElementById('questionsContainer');
const addQuestionBtn = document.getElementById('addQuestionBtn');
const saveQuizBtn = document.getElementById('saveQuizBtn');

// Quiz Listing Elements
const quizListDiv = document.getElementById('quizList');
const noQuizzesMessage = document.getElementById('noQuizzesMessage');
const createQuizFromListBtn = document.getElementById('createQuizFromListBtn');
createQuizFromListBtn.addEventListener('click', () => navigateTo('create-quiz-section'));
const quizHistoryListDiv = document.getElementById('quizHistoryList');
const noQuizHistoryMessage = document.getElementById('noQuizHistoryMessage');
const leaderboardDiv = document.getElementById('leaderboard');
const noLeaderboardMessage = document.getElementById('noLeaderboardMessage');


// Quiz Taking Elements
const quizTakingTitle = document.getElementById('quizTakingTitle');
const quizTakingContent = document.getElementById('quizTakingContent');

// Quiz Results Elements
const quizResultsContent = document.getElementById('quizResultsContent');

// Mini Test Elements
const miniTestWrapper = document.getElementById('miniTestWrapper');
const miniTestMainText = document.getElementById('miniTestMainText');
const miniTestUsername = document.getElementById('miniTestUsername');
const miniTestButtons = document.getElementById('miniTestButtons');
const miniTestBtnY = document.getElementById('miniTestBtnY');
const miniTestBtnN = document.getElementById('miniTestBtnN');

// Quiz Preferences Elements
const categoryButtons = document.querySelectorAll('.category-btn');
const categoryDescriptionDiv = document.getElementById('categoryDescription');


// --- Message Box Logic ---
function showMessageBox(message, type = 'info', onConfirm = null, showInput = false, onInputChange = null, inputValue = '', inputPlaceholder = '') {
    const messageBoxContainer = document.getElementById('messageBoxContainer');
    messageBoxContainer.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000]">
            <div class="glass-card p-6 rounded-lg shadow-xl max-w-sm w-full text-center border
                ${type === 'error' ? 'bg-red-500 border-red-700' : type === 'success' ? 'bg-green-500 border-green-700' : 'bg-blue-500 border-blue-700'}">
                <p class="text-white text-lg mb-6">${message}</p>
                ${showInput ? `<input type="text" id="messageBoxInput" placeholder="${inputPlaceholder}" value="${inputValue}" class="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400">` : ''}
                <div class="flex justify-center space-x-4">
                    ${onConfirm ? `<button id="messageBoxConfirmBtn" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 glow-button">Confirm</button>` : ''}
                    <button id="messageBoxCloseBtn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 glow-button">
                        ${onConfirm ? 'Cancel' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    `;

    const closeBtn = document.getElementById('messageBoxCloseBtn');
    closeBtn.onclick = () => {
        messageBoxContainer.innerHTML = '';
        if (type === 'input' && onConfirm === null) { // If input was cancelled
            if (onInputChange) onInputChange({ target: { value: '' } }); // Clear input value
        }
    };

    if (onConfirm) {
        const confirmBtn = document.getElementById('messageBoxConfirmBtn');
        confirmBtn.onclick = () => {
            messageBoxContainer.innerHTML = '';
            onConfirm();
        };
    }

    if (showInput && onInputChange) {
        const inputElement = document.getElementById('messageBoxInput');
        inputElement.oninput = onInputChange;
        inputElement.focus();
    }
}

// --- Navigation Logic ---
function navigateTo(sectionId) {
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.remove('section-hidden');
            section.classList.add('section-visible');
            section.scrollIntoView({ behavior: 'smooth' });
        } else {
            section.classList.remove('section-visible');
            section.classList.add('section-hidden');
        }
    });
    currentView = sectionId;

    // Specific actions for sections
    if (sectionId === 'create-quiz-section') {
        resetQuizCreationForm();
    } else if (sectionId === 'quiz-listing-section') {
        renderQuizList();
        renderQuizHistory(); // Render history when listing quizzes
        renderLeaderboard(); // Render leaderboard when listing quizzes
    } else if (sectionId === 'mini-test-section') {
        // Ensure mini test state is reset and started when navigating to it
        startMiniTest();
    }
}

// --- Section Fade-in on Scroll (Intersection Observer) ---
const observerOptions = {
    root: null, /* viewport */
    rootMargin: '0px',
    threshold: 0.1 /* 10% of section visible */
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.remove('section-hidden');
            entry.target.classList.add('section-visible');
        } else {
            // Optional: re-hide if scrolling out of view
            // entry.target.classList.remove('section-visible');
            // entry.target.classList.add('section-hidden');
        }
    });
}, observerOptions);

sections.forEach(section => {
    section.classList.add('section-hidden'); // Add hidden class initially
    sectionObserver.observe(section);
});

// --- Quiz Creation Logic ---
let currentQuestions = [JSON.parse(JSON.stringify(quizQuestionsTemplate))]; // Deep copy
function renderQuestions() {
    questionsContainer.innerHTML = '';
    currentQuestions.forEach((q, qIndex) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'glass-card p-6 rounded-xl shadow-lg mb-6';
        questionDiv.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-2xl font-semibold text-pink-400">Question ${qIndex + 1}</h3>
                ${currentQuestions.length > 1 ? `<button data-index="${qIndex}" class="remove-question-btn bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold transition duration-300 glow-button text-sm">Remove</button>` : ''}
            </div>
            <input type="text" placeholder="Question Text" value="${q.questionText}" data-index="${qIndex}" class="question-text-input w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                ${q.options.map((option, oIndex) => `
                    <input type="text" placeholder="Option ${oIndex + 1}" value="${option}" data-q-index="${qIndex}" data-o-index="${oIndex}" class="option-text-input w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400">
                `).join('')}
            </div>
            <div class="flex items-center">
                <label class="text-white mr-4">Correct Answer:</label>
                <select data-index="${qIndex}" class="correct-answer-select p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-emerald-400">
                    ${q.options.map((option, oIndex) => `
                        <option value="${oIndex}" ${q.correctAnswerIndex === oIndex ? 'selected' : ''}>Option ${oIndex + 1}</option>
                    `).join('')}
                </select>
            </div>
        `;
        questionsContainer.appendChild(questionDiv);
    });

    // Add event listeners for new elements
    questionsContainer.querySelectorAll('.question-text-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            currentQuestions[index].questionText = e.target.value;
        });
    });
    questionsContainer.querySelectorAll('.option-text-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const qIndex = parseInt(e.target.dataset.qIndex);
            const oIndex = parseInt(e.target.dataset.oIndex);
            currentQuestions[qIndex].options[oIndex] = e.target.value;
        });
    });
    questionsContainer.querySelectorAll('.correct-answer-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            currentQuestions[index].correctAnswerIndex = parseInt(e.target.value);
        });
    });
    questionsContainer.querySelectorAll('.remove-question-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            currentQuestions.splice(index, 1);
            renderQuestions(); // Re-render to update indices
        });
    });
}

addQuestionBtn.addEventListener('click', () => {
    currentQuestions.push(JSON.parse(JSON.stringify(quizQuestionsTemplate)));
    renderQuestions();
});

saveQuizBtn.addEventListener('click', () => {
    const title = quizTitleInput.value.trim();
    const category = quizCategoryInput.value.trim();
    const description = quizDescriptionInput.value.trim();

    if (!title || !category || currentQuestions.some(q => !q.questionText.trim() || q.options.some(o => !o.trim()))) {
        showMessageBox("Please fill in quiz title, category, all questions, and options.", "error");
        return;
    }

    const newQuiz = {
        id: Date.now().toString(), // Simple unique ID
        title,
        category,
        description,
        questions: currentQuestions,
        createdAt: new Date().toISOString(),
        createdBy: userName || 'Anonymous' // Use username if available
    };

    quizzes.push(newQuiz);
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    showMessageBox("Quiz saved successfully!", "success");
    navigateTo('quiz-listing-section');
});

function resetQuizCreationForm() {
    quizTitleInput.value = '';
    quizCategoryInput.value = '';
    quizDescriptionInput.value = '';
    currentQuestions = [JSON.parse(JSON.stringify(quizQuestionsTemplate))];
    renderQuestions();
}

// --- Quiz Listing Logic ---
function loadQuizzes() {
    const storedQuizzes = localStorage.getItem('quizzes');
    quizzes = storedQuizzes ? JSON.parse(storedQuizzes) : [];

    // Add fake quizzes if localStorage is empty or if specific fake quizzes are missing
    const existingQuizIds = new Set(quizzes.map(q => q.id));
    const fakeQuizzesToAdd = [
        {
            id: '1',
            title: 'Basic Math Quiz',
            category: 'Math',
            description: 'A simple quiz to test your basic math skills: addition, subtraction, multiplication, and division. Perfect for students and enthusiasts alike.',
            questions: [
                { questionText: 'What is 5 + 3?', options: ['7', '8', '9', '10'], correctAnswerIndex: 1 },
                { questionText: 'What is 10 - 4?', options: ['5', '6', '7', '8'], correctAnswerIndex: 1 },
                { questionText: 'What is 3 * 7?', options: ['20', '21', '24', '27'], correctAnswerIndex: 1 },
                { questionText: 'What is 20 / 5?', options: ['2', '3', '4', '5'], correctAnswerIndex: 2 },
            ],
            createdAt: '2023-01-15T10:00:00Z',
            createdBy: 'QuizMaster'
        },
        {
            id: '2',
            title: 'Science Fundamentals',
            category: 'Science',
            description: 'Explore fundamental concepts in science: biology, chemistry, physics, and environmental science. Learn about the world around us!',
            questions: [
                { questionText: 'What is the chemical symbol for water?', options: ['O2', 'H2O', 'CO2', 'NaCl'], correctAnswerIndex: 1 },
                { questionText: 'What planet is known as the Red Planet?', options: ['Earth', 'Jupiter', 'Mars', 'Venus'], correctAnswerIndex: 2 },
                { questionText: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Cytoplasm'], correctAnswerIndex: 1 },
                { questionText: 'What force pulls objects towards the center of the Earth?', options: ['Friction', 'Tension', 'Gravity', 'Magnetism'], correctAnswerIndex: 2 },
            ],
            createdAt: '2023-02-20T14:30:00Z',
            createdBy: 'ScienceWhiz'
        },
        {
            id: '3',
            title: 'World History Basics',
            category: 'History',
            description: 'Journey through time! Test your knowledge on ancient civilizations, world wars, famous figures, and pivotal moments in human history.',
            questions: [
                { questionText: 'Who was the first President of the United States?', options: ['Abraham Lincoln', 'George Washington', 'Thomas Jefferson', 'John Adams'], correctAnswerIndex: 1 },
                { questionText: 'In which year did World War II end?', options: ['1942', '1945', '1950', '1939'], correctAnswerIndex: 1 },
                { questionText: 'Which ancient civilization built the pyramids?', options: ['Roman', 'Greek', 'Egyptian', 'Mayan'], correctAnswerIndex: 2 },
            ],
            createdAt: '2023-03-10T09:15:00Z',
            createdBy: 'HistoryFan'
        },
        {
            id: '4',
            title: 'Intro to Programming Concepts',
            category: 'Programming',
            description: 'Basic questions for aspiring coders: variables, loops, functions, and data types. Get started on your coding journey!',
            questions: [
                { questionText: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High-Level Text Machine Language', 'Hyperlink and Text Markup Language', 'Home Tool Markup Language'], correctAnswerIndex: 0 },
                { questionText: 'Which language is often used for web development?', options: ['Python', 'Java', 'JavaScript', 'C++'], correctAnswerIndex: 2 },
                { questionText: 'What is a variable?', options: ['A fixed value', 'A storage location for data', 'A type of loop', 'A function call'], correctAnswerIndex: 1 },
            ],
            createdAt: '2023-04-01T11:00:00Z',
            createdBy: 'CodeGuru'
        },
        {
            id: '5',
            title: 'General Knowledge Challenge',
            category: 'General Knowledge',
            description: 'Broaden your horizons! A mix of questions from various fields including current events, geography, literature, and pop culture. How much do you know?',
            questions: [
                { questionText: 'What is the capital of France?', options: ['Rome', 'Berlin', 'Madrid', 'Paris'], correctAnswerIndex: 3 },
                { questionText: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctAnswerIndex: 3 },
                { questionText: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], correctAnswerIndex: 1 },
            ],
            createdAt: '2023-04-20T13:45:00Z',
            createdBy: 'TriviaMaster'
        }
    ];

    fakeQuizzesToAdd.forEach(fakeQuiz => {
        if (!existingQuizIds.has(fakeQuiz.id)) {
            quizzes.push(fakeQuiz);
        }
    });
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
}

function loadQuizHistory() {
    const storedHistory = localStorage.getItem('quizHistory');
    quizHistory = storedHistory ? JSON.parse(storedHistory) : [];

    // Add fake quiz history if localStorage is empty or if specific fake history entries are missing
    const existingHistoryKeys = new Set(quizHistory.map(h => `${h.quizId}-${h.user}-${h.date}`));
    const fakeHistoryToAdd = [
        { quizId: '1', quizTitle: 'Basic Math Quiz', score: 3, totalQuestions: 4, user: 'Alice', date: '2023-05-01T12:00:00Z', profilePic: 'https://placehold.co/40x40/FF5733/FFFFFF?text=A' },
        { quizId: '2', quizTitle: 'Science Fundamentals', score: 2, totalQuestions: 4, user: 'Bob', date: '2023-05-05T10:30:00Z', profilePic: 'https://placehold.co/40x40/33FF57/FFFFFF?text=B' },
        { quizId: '1', quizTitle: 'Basic Math Quiz', score: 4, totalQuestions: 4, user: 'Charlie', date: '2023-05-10T15:00:00Z', profilePic: 'https://placehold.co/40x40/3357FF/FFFFFF?text=C' },
        { quizId: '3', quizTitle: 'World History Basics', score: 2, totalQuestions: 3, user: 'Alice', date: '2023-05-12T11:00:00Z', profilePic: 'https://placehold.co/40x40/FF33FF/FFFFFF?text=A' },
        { quizId: '4', quizTitle: 'Intro to Programming Concepts', score: 3, totalQuestions: 3, user: 'Bob', date: '2023-05-15T16:00:00Z', profilePic: 'https://placehold.co/40x40/FFFF33/000000?text=B' },
        { quizId: '5', quizTitle: 'General Knowledge Challenge', score: 3, totalQuestions: 3, user: 'Charlie', date: '2023-05-18T09:00:00Z', profilePic: 'https://placehold.co/40x40/33FFFF/000000?text=C' },
        { quizId: '1', quizTitle: 'Basic Math Quiz', score: 4, totalQuestions: 4, user: 'David', date: '2023-05-20T14:00:00Z', profilePic: 'https://placehold.co/40x40/FF8C33/FFFFFF?text=D' },
        { quizId: '2', quizTitle: 'Science Fundamentals', score: 4, totalQuestions: 4, user: 'Eve', date: '2023-05-22T11:00:00Z', profilePic: 'https://placehold.co/40x40/33FF8C/FFFFFF?text=E' },
    ];

    fakeHistoryToAdd.forEach(fakeRecord => {
        const key = `${fakeRecord.quizId}-${fakeRecord.user}-${fakeRecord.date}`;
        if (!existingHistoryKeys.has(key)) {
            quizHistory.push(fakeRecord);
        }
    });
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
}


function renderQuizList() {
    loadQuizzes(); // Ensure latest quizzes are loaded
    quizListDiv.innerHTML = '';
    const filteredQuizzes = quizzes.filter(quiz => {
        if (selectedCategories.size === 0 || selectedCategories.has('All')) {
            return true; // Show all if no categories selected or 'All' is selected
        }
        return selectedCategories.has(quiz.category);
    });

    if (filteredQuizzes.length === 0) {
        noQuizzesMessage.classList.remove('hidden');
    } else {
        noQuizzesMessage.classList.add('hidden');
        filteredQuizzes.forEach(quiz => {
            const quizCard = document.createElement('div');
            quizCard.className = 'glass-card p-6 rounded-xl shadow-lg flex flex-col justify-between';
            quizCard.innerHTML = `
                <div>
                    <h3 class="text-2xl font-semibold text-cyan-300 mb-2">${quiz.title}</h3>
                    <p class="text-gray-300 text-sm mb-2">Category: ${quiz.category || 'N/A'}</p>
                    <p class="text-gray-300 text-sm mb-4">${quiz.description || 'No description provided.'}</p>
                    <p class="text-gray-400 text-xs">Questions: ${quiz.questions?.length || 0}</p>
                    <p class="text-gray-400 text-xs">Created by: ${quiz.createdBy}</p>
                </div>
                <div class="flex justify-between items-center mt-4">
                    <button data-quiz-id="${quiz.id}" class="take-quiz-btn bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-full font-semibold hover:from-emerald-600 hover:to-green-700 transition duration-300 glow-button text-sm">
                        Take Quiz
                    </button>
                    <button data-quiz-id="${quiz.id}" class="delete-quiz-btn bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold transition duration-300 glow-button text-sm">
                        Delete
                    </button>
                </div>
            `;
            quizListDiv.appendChild(quizCard);
        });

        quizListDiv.querySelectorAll('.take-quiz-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const quizId = e.target.dataset.quizId;
                currentQuiz = quizzes.find(q => q.id === quizId);
                if (currentQuiz) {
                    startQuizTaking();
                }
            });
        });

        quizListDiv.querySelectorAll('.delete-quiz-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const quizId = e.target.dataset.quizId;
                showMessageBox("Are you sure you want to delete this quiz?", "confirm", () => {
                    quizzes = quizzes.filter(q => q.id !== quizId);
                    localStorage.setItem('quizzes', JSON.stringify(quizzes));
                    showMessageBox("Quiz deleted successfully!", "success");
                    renderQuizList(); // Re-render the list
                });
            });
        });
    }
}

function renderQuizHistory() {
    loadQuizHistory();
    quizHistoryListDiv.innerHTML = '';
    if (quizHistory.length === 0) {
        noQuizHistoryMessage.classList.remove('hidden');
    } else {
        noQuizHistoryMessage.classList.add('hidden');
        // Sort history by date, newest first
        const sortedHistory = [...quizHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedHistory.forEach(record => {
            const historyCard = document.createElement('div');
            historyCard.className = 'glass-card p-6 rounded-xl shadow-lg flex flex-col justify-between';
            const date = new Date(record.date).toLocaleDateString();
            const time = new Date(record.date).toLocaleTimeString();
            historyCard.innerHTML = `
                <div>
                    <h3 class="text-xl font-semibold text-pink-300 mb-2">${record.quizTitle}</h3>
                    <p class="text-gray-300 text-sm mb-1">User: ${record.user}</p>
                    <p class="text-gray-300 text-sm mb-1">Score: ${record.score} / ${record.totalQuestions}</p>
                    <p class="text-gray-400 text-xs">Date: ${date} at ${time}</p>
                </div>
            `;
            quizHistoryListDiv.appendChild(historyCard);
        });
    }
}

function renderLeaderboard() {
    loadQuizHistory();
    leaderboardDiv.innerHTML = ''; // Clear previous leaderboard
    noLeaderboardMessage.classList.add('hidden'); // Hide message initially

    if (quizHistory.length === 0) {
        noLeaderboardMessage.classList.remove('hidden');
        return;
    }

    // Aggregate scores per user
    const userScores = {};
    quizHistory.forEach(record => {
        if (!userScores[record.user]) {
            userScores[record.user] = { totalScore: 0, totalQuizzes: 0, profilePic: record.profilePic };
        }
        userScores[record.user].totalScore += record.score;
        userScores[record.user].totalQuizzes += 1;
    });

    // Convert to array and sort by average score
    const sortedUsers = Object.keys(userScores).map(user => ({
        user: user,
        averageScore: userScores[user].totalScore / userScores[user].totalQuizzes,
        profilePic: userScores[user].profilePic
    })).sort((a, b) => b.averageScore - a.averageScore); // Descending order

    if (sortedUsers.length === 0) {
        noLeaderboardMessage.classList.remove('hidden');
        return;
    }

    let leaderboardHtml = `<div class="space-y-3">`;
    sortedUsers.slice(0, 5).forEach((userEntry, index) => { // Show top 5
        const stars = '⭐'.repeat(Math.min(5, Math.floor(userEntry.averageScore))); // Max 5 stars
        leaderboardHtml += `
            <div class="leaderboard-entry">
                <span class="rank">${index + 1}.</span>
                <img src="${userEntry.profilePic}" alt="${userEntry.user}'s profile" onerror="this.onerror=null;this.src='https://placehold.co/40x40/808080/FFFFFF?text=U';">
                <span class="name">${userEntry.user}</span>
                <span class="score">${userEntry.averageScore.toFixed(1)} Avg.</span>
                <span class="stars">${stars}</span>
            </div>
        `;
    });
    leaderboardHtml += `</div>`;
    leaderboardDiv.innerHTML = leaderboardHtml;
}


// --- Quiz Taking Logic ---
let currentQuestionIndex = 0;
let selectedAnswerIndex = null;

function startQuizTaking() {
    currentQuestionIndex = 0;
    userAnswers = [];
    selectedAnswerIndex = null;
    navigateTo('quiz-taking-section');
    renderQuizQuestion();
}

function renderQuizQuestion() {
    if (!currentQuiz || !currentQuiz.questions[currentQuestionIndex]) {
        showMessageBox("Error: Quiz data missing.", "error");
        navigateTo('quiz-listing-section');
        return;
    }

    const question = currentQuiz.questions[currentQuestionIndex];
    quizTakingTitle.innerHTML = `Taking <span class="text-cyan-400">${currentQuiz.title}</span>`;
    quizTakingContent.innerHTML = `
        <p class="text-gray-300 text-lg mb-4">Question ${currentQuestionIndex + 1} of ${currentQuiz.questions.length}</p>
        <h3 class="text-2xl font-semibold text-white mb-6">${question.questionText}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="optionsContainer">
            ${question.options.map((option, index) => `
                <button data-option-index="${index}" class="option-btn p-4 rounded-lg text-left transition duration-300 bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 text-white font-medium">
                    ${option}
                </button>
            `).join('')}
        </div>
        <button id="nextQuestionBtn" class="mt-8 w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-indigo-700 transition duration-300 glow-button">
            ${currentQuestionIndex < currentQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </button>
    `;

    document.getElementById('optionsContainer').querySelectorAll('.option-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            selectedAnswerIndex = parseInt(e.target.dataset.optionIndex);
            document.getElementById('optionsContainer').querySelectorAll('.option-btn').forEach(btn => {
                btn.classList.remove('bg-blue-600', 'border-blue-700', 'glow-button');
                btn.classList.add('bg-gray-700', 'border-gray-600');
            });
            e.target.classList.add('bg-blue-600', 'border-blue-700', 'glow-button');
        });
    });

    document.getElementById('nextQuestionBtn').addEventListener('click', handleNextQuestion);
}

function handleNextQuestion() {
    if (selectedAnswerIndex === null) {
        showMessageBox("Please select an answer before proceeding.", "error");
        return;
    }

    userAnswers.push({
        questionIndex: currentQuestionIndex,
        selectedOptionIndex: selectedAnswerIndex,
        correctOptionIndex: currentQuiz.questions[currentQuestionIndex].correctAnswerIndex
    });
    selectedAnswerIndex = null; // Reset for next question

    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        renderQuizQuestion();
    } else {
        renderQuizResults();
    }
}

// --- Quiz Results Logic ---
function renderQuizResults() {
    navigateTo('quiz-results-section');
    const score = userAnswers.filter(answer => answer.selectedOptionIndex === answer.correctOptionIndex).length;
    const totalQuestions = currentQuiz.questions.length;
    const percentage = (score / totalQuestions) * 100;
    const stars = '⭐'.repeat(Math.min(5, Math.floor(percentage / 20))); // 1 star per 20%

    // Save result to history
    const newResult = {
        quizId: currentQuiz.id,
        quizTitle: currentQuiz.title,
        score: score,
        totalQuestions: totalQuestions,
        user: userName || 'Anonymous',
        date: new Date().toISOString(),
        profilePic: `https://placehold.co/40x40/RANDOM_COLOR/FFFFFF?text=${(userName || 'U').charAt(0).toUpperCase()}` // Dynamic placeholder for user
    };
    quizHistory.push(newResult);
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));


    let resultsHtml = `
        <p class="text-3xl font-bold text-white mb-4">Your Score:</p>
        <p class="text-5xl font-extrabold text-cyan-400 mb-2">${score} / ${totalQuestions}</p>
        <p class="text-4xl font-extrabold text-pink-400 mb-6">${stars}</p>
        <h3 class="text-2xl font-semibold text-white mb-4">Detailed Results:</h3>
        <div class="space-y-4 text-left">
    `;

    currentQuiz.questions.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer.selectedOptionIndex === userAnswer.correctOptionIndex;
        const selectedOptionText = q.options[userAnswer.selectedOptionIndex];
        const correctOptionText = q.options[userAnswer.correctAnswerIndex];

        resultsHtml += `
            <div class="p-4 rounded-lg ${isCorrect ? 'bg-green-800 bg-opacity-30' : 'bg-red-800 bg-opacity-30'} border ${isCorrect ? 'border-green-600' : 'border-red-600'}">
                <p class="font-semibold text-lg text-white mb-2">Q${index + 1}: ${q.questionText}</p>
                <p class="text-gray-300">Your Answer: <span class="${isCorrect ? 'text-green-300' : 'text-red-300'}">${selectedOptionText}</span></p>
                ${!isCorrect ? `<p class="text-gray-300">Correct Answer: <span class="text-green-300">${correctOptionText}</span></p>` : ''}
            </div>
        `;
    });

    resultsHtml += `
        </div>
        <button id="backToQuizzesBtn" class="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-indigo-700 transition duration-300 glow-button">
            Back to Quizzes
        </button>
    `;
    quizResultsContent.innerHTML = resultsHtml;

    document.getElementById('backToQuizzesBtn').addEventListener('click', () => navigateTo('quiz-listing-section'));
}

// --- Mini Test Logic ---
const miniTestQuestions = [
    ['5 < 3 ?'],
    ['5 + 10 * 2 = 30 ?'],
    ['0 * 1 = 1 ?'],
    ['32 / 2 = 16 ?'],
    ['John is "he" ?'],
    ['Anna is "his" ?'],
    ['The capital of China is "Shanghai" ?'],
    ['25 * 3 + 15 / 3 = 85 ?'],
    ['15 > 8 ?'],
    ['Did you like this test ?']
];

const miniTestAnswers = [
    ['No'],
    ['No'],
    ['No'],
    ['Yes'],
    ['Yes'],
    ['No'],
    ['No'],
    ['No'],
    ['Yes'],
    ['Yes']
];

function startMiniTest() {
    miniTestState = {
        countdown: 5, // Reset countdown
        testStarted: false,
        currentQuestionIndex: 0,
        score: 0,
        testCompleted: false,
        selectedAnswer: null,
    };
    miniTestButtons.classList.add('notactive'); // Hide buttons initially
    miniTestMainText.textContent = "Welcome to Our Mini Test!";
    miniTestUsername.textContent = "";
    // Remove back to home button if it exists from previous run
    const existingBackBtn = miniTestWrapper.querySelector('#miniTestBackToHomeBtn');
    if (existingBackBtn) {
        existingBackBtn.remove();
    }

    // Prompt for username
    showMessageBox(
        "Please, enter your name?",
        "input",
        () => { // onConfirm
            const inputElement = document.getElementById('messageBoxInput');
            const enteredName = inputElement ? inputElement.value.trim() : '';
            if (enteredName) {
                userName = enteredName;
                miniTestUsername.textContent = `${userName}, nice to see you`;
                startMiniTestCountdown();
            } else {
                showMessageBox("Please enter your name :)", "error", null, true, (e) => userName = e.target.value, userName, "Your Name");
            }
        },
        true, // showInput
        (e) => userName = e.target.value, // onInputChange
        userName, // inputValue
        "Your Name" // inputPlaceholder
    );
}

function startMiniTestCountdown() {
    let sec = miniTestState.countdown;
    miniTestUsername.textContent = `Test will start in ${sec}...`;

    const countdownInterval = setInterval(() => {
        sec--;
        miniTestState.countdown = sec; // Update state
        miniTestUsername.textContent = `Test will start in ${sec}...`;
        if (sec <= 0) {
            clearInterval(countdownInterval);
            miniTestState.testStarted = true;
            miniTestButtons.classList.remove('notactive');
            miniTestButtons.classList.add('active');
            renderMiniTestQuestion();
        }
    }, 1000);
}

function renderMiniTestQuestion() {
    miniTestUsername.textContent = `${userName || 'Guest'}, think about it :)`;
    miniTestMainText.textContent = miniTestQuestions[miniTestState.currentQuestionIndex][0];

    // Reset button styles
    miniTestBtnY.classList.remove('bg-blue-600');
    miniTestBtnN.classList.remove('bg-blue-600');
    miniTestBtnY.classList.add('mini-test-btn-primary');
    miniTestBtnN.classList.add('mini-test-btn-primary');
}

function handleMiniTestAnswer(answer) {
    miniTestState.selectedAnswer = answer;
    // Apply visual feedback
    if (answer === 'Yes') {
        miniTestBtnY.classList.add('bg-blue-600');
        miniTestBtnN.classList.remove('bg-blue-600');
    } else {
        miniTestBtnN.classList.add('bg-blue-600');
        miniTestBtnY.classList.remove('bg-blue-600');
    }

    // Process answer and move to next question after a short delay for visual feedback
    setTimeout(() => {
        const currentCorrectAnswer = miniTestAnswers[miniTestState.currentQuestionIndex][0];
        if (miniTestState.selectedAnswer === currentCorrectAnswer) {
            miniTestState.score += 10;
        }

        miniTestState.currentQuestionIndex++;
        miniTestState.selectedAnswer = null; // Reset selected answer for next question

        if (miniTestState.currentQuestionIndex < miniTestQuestions.length) {
            renderMiniTestQuestion();
        } else {
            miniTestState.testCompleted = true;
            displayMiniTestResults();
        }
    }, 300); // Short delay
}

function displayMiniTestResults() {
    miniTestButtons.classList.remove('active');
    miniTestButtons.classList.add('notactive');

    miniTestMainText.innerHTML = `${userName || 'Guest'}, your score is ${miniTestState.score} from ${miniTestQuestions.length * 10}`;
    miniTestUsername.textContent = 'Thank You!';

    // Add a "Back to Home" button after results
    const backToHomeBtn = document.createElement('button');
    backToHomeBtn.id = 'miniTestBackToHomeBtn';
    backToHomeBtn.className = 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-indigo-700 transition duration-300 glow-button mt-8';
    backToHomeBtn.textContent = 'Back to Home';
    backToHomeBtn.addEventListener('click', () => navigateTo('home-section'));
    miniTestWrapper.appendChild(backToHomeBtn);
}

miniTestBtnY.addEventListener('click', () => handleMiniTestAnswer('Yes'));
miniTestBtnN.addEventListener('click', () => handleMiniTestAnswer('No'));

// --- Quiz Preferences Logic ---
function handleCategorySelection(event) {
    const category = event.target.dataset.category;
    let descriptionText = categoryDescriptions[category] || "Select a category to see a description of the quizzes you can create or take!";

    // Update category description
    categoryDescriptionDiv.innerHTML = `<p>${descriptionText}</p>`;

    if (category === 'All') {
        selectedCategories.clear();
        selectedCategories.add('All'); // Explicitly select 'All'
        categoryButtons.forEach(btn => {
            if (btn.dataset.category !== 'All') {
                btn.classList.remove('selected');
                btn.classList.remove('bg-gradient-to-r', 'from-blue-500', 'to-indigo-600'); // Remove gradient
                btn.classList.add('bg-gray-700'); // Add default gray
            }
        });
        event.target.classList.add('selected');
        event.target.classList.remove('bg-gray-700'); // Remove default gray
        event.target.classList.add('bg-gradient-to-r', 'from-purple-500', 'to-pink-600'); // Apply gradient
    } else {
        if (selectedCategories.has('All')) {
            selectedCategories.clear(); // Clear 'All' if a specific category is chosen
            const allBtn = document.querySelector('.category-btn[data-category="All"]');
            if (allBtn) {
                allBtn.classList.remove('selected');
                allBtn.classList.remove('bg-gradient-to-r', 'from-purple-500', 'to-pink-600');
                allBtn.classList.add('bg-gray-700');
            }
        }

        if (selectedCategories.has(category)) {
            selectedCategories.delete(category);
            event.target.classList.remove('selected');
            event.target.classList.remove('bg-gradient-to-r', 'from-blue-500', 'to-indigo-600'); // Remove gradient
            event.target.classList.add('bg-gray-700'); // Add default gray
        } else {
            selectedCategories.add(category);
            event.target.classList.add('selected');
            event.target.classList.remove('bg-gray-700'); // Remove default gray
            event.target.classList.add('bg-gradient-to-r', 'from-blue-500', 'to-indigo-600'); // Apply gradient
        }

        if (selectedCategories.size === 0) {
            selectedCategories.add('All');
            const allBtn = document.querySelector('.category-btn[data-category="All"]');
            if (allBtn) {
                allBtn.classList.add('selected');
                allBtn.classList.remove('bg-gray-700');
                allBtn.classList.add('bg-gradient-to-r', 'from-purple-500', 'to-pink-600');
            }
        }
    }
    renderQuizList(); // Re-render quiz list based on new selection
}

categoryButtons.forEach(button => {
    button.addEventListener('click', handleCategorySelection);
});


// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    navigateTo('home-section'); // Start on the home page
    renderQuestions(); // Initialize quiz creation form
    // Set 'All' category as selected by default on load and show its description
    selectedCategories.add('All');
    const allBtn = document.querySelector('.category-btn[data-category="All"]');
    if (allBtn) {
        allBtn.classList.add('selected');
        allBtn.classList.remove('bg-gray-700');
        allBtn.classList.add('bg-gradient-to-r', 'from-purple-500', 'to-pink-600');
    }
    categoryDescriptionDiv.innerHTML = `<p>${categoryDescriptions['All']}</p>`;
});
