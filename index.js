// Elements
const homePage = document.getElementById('homePage');
const quizPage = document.getElementById('quizPage');
const userForm = document.getElementById('userForm');
const welcomeMsg = document.getElementById('welcomeMsg');

// Quiz variables
const timerEl = document.getElementById('timer');
const penaltyEl = document.getElementById('penaltyCount');
const progress = document.getElementById('progress');
const questionContainer = document.getElementById('questionContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const scoreDisplay = document.getElementById('scoreDisplay');
let useremail = ""
let currentIndex = 0;
let userAnswers = new Array(30).fill(null);
let penalties = 0;
let timeLeft = 35 * 60; // 35 minutes
let timerInterval = null;
let quizSubmitted = false;
let userscore = 0

// Questions (10 easy, 10 medium, 10 hard)
const easyQuestions = [
    { q: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "Sequential Query Language", "Standard Question Language"], answer: 0 },
    { q: "Which command is used to retrieve data from a database?", options: ["SELECT", "INSERT", "UPDATE", "DELETE"], answer: 0 },
    { q: "Which SQL command is used to add new data?", options: ["UPDATE", "INSERT", "SELECT", "DELETE"], answer: 1 },
    { q: "Which keyword is used to filter records?", options: ["WHERE", "FROM", "ORDER BY", "GROUP BY"], answer: 0 },
    { q: "Which SQL statement is used to delete data?", options: ["DROP", "DELETE", "REMOVE", "TRUNCATE"], answer: 1 },
    { q: "Which command creates a new table?", options: ["CREATE TABLE", "NEW TABLE", "MAKE TABLE", "ADD TABLE"], answer: 0 },
    { q: "Which symbol is used to select all columns?", options: ["*", "%", "$", "#"], answer: 0 },
    { q: "How do you start a comment in SQL?", options: ["--", "/*", "#", "//"], answer: 0 },
    { q: "Which SQL keyword sorts the result?", options: ["ORDER BY", "SORT", "GROUP BY", "FILTER"], answer: 0 },
    { q: "Which clause groups rows that have the same values?", options: ["GROUP BY", "ORDER BY", "WHERE", "HAVING"], answer: 0 },
];

const mediumQuestions = [
    { q: "Which SQL command is used to change data in a table?", options: ["UPDATE", "MODIFY", "CHANGE", "ALTER"], answer: 0 },
    { q: "What does JOIN do in SQL?", options: ["Combines rows from tables", "Deletes tables", "Creates new database", "Updates rows"], answer: 0 },
    { q: "Which type of join returns all rows from the left table?", options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN"], answer: 0 },
    { q: "What does the COUNT() function do?", options: ["Counts rows", "Counts columns", "Counts NULLs", "Counts duplicates"], answer: 0 },
    { q: "Which clause filters groups after GROUP BY?", options: ["HAVING", "WHERE", "ORDER BY", "FILTER"], answer: 0 },
    { q: "What is the default sorting order of ORDER BY?", options: ["Ascending", "Descending", "Random", "None"], answer: 0 },
    { q: "Which data type is used to store textual data?", options: ["VARCHAR", "INT", "DATE", "FLOAT"], answer: 0 },
    { q: "What does the DISTINCT keyword do?", options: ["Removes duplicates", "Adds duplicates", "Sorts data", "Filters NULLs"], answer: 0 },
    { q: "What is the purpose of the LIKE operator?", options: ["Pattern matching", "Exact matching", "Null checking", "Sorting"], answer: 0 },
    { q: "Which function extracts a substring?", options: ["SUBSTRING()", "EXTRACT()", "SLICE()", "CUT()"], answer: 0 },
];

const hardQuestions = [
    { q: "Which SQL statement is used to add a column to a table?", options: ["ALTER TABLE ADD COLUMN", "UPDATE TABLE", "MODIFY TABLE", "CHANGE TABLE"], answer: 0 },
    { q: "What is a correlated subquery?", options: ["A subquery that references outer query", "A subquery that runs independently", "A join operation", "A stored procedure"], answer: 0 },
    { q: "Which SQL clause limits the number of rows returned?", options: ["LIMIT", "TOP", "MAX", "ROWNUM"], answer: 0 },
    { q: "Which command is used to remove duplicates from a result set?", options: ["DISTINCT", "UNIQUE", "REMOVE DUPLICATES", "FILTER"], answer: 0 },
    { q: "What is the difference between DELETE and TRUNCATE?", options: ["DELETE is logged, TRUNCATE is not", "TRUNCATE logs data, DELETE does not", "They are the same", "TRUNCATE can be rolled back"], answer: 0 },
    { q: "Which command renames a table?", options: ["ALTER TABLE RENAME TO", "RENAME TABLE", "MODIFY TABLE NAME", "CHANGE TABLE NAME"], answer: 0 },
    { q: "What is a primary key?", options: ["Unique identifier for a record", "Foreign key", "Duplicate key", "Null key"], answer: 0 },
    { q: "Which SQL command is used to create an index?", options: ["CREATE INDEX", "MAKE INDEX", "ADD INDEX", "NEW INDEX"], answer: 0 },
    { q: "What does a foreign key do?", options: ["References primary key in another table", "Deletes rows", "Creates new table", "Updates rows"], answer: 0 },
    { q: "Which transaction command commits the changes?", options: ["COMMIT", "ROLLBACK", "SAVEPOINT", "START"], answer: 0 },
];

const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];

// Timer helper
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Timer start
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = "Time Left: " + formatTime(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }
    }, 1000);
}

// Render question
function renderQuestion(index) {
    const q = allQuestions[index];
    questionContainer.innerHTML = `
      <div><strong>Question ${index + 1} / 30</strong></div>
      <h3>${q.q}</h3>
      <div>
        ${q.options.map((opt, i) => `
          <label style="display:block; margin-bottom:6px;">
            <input 
              type="radio" 
              name="answer" 
              value="${i}" 
              ${userAnswers[index] === i ? 'checked' : ''} 
            />
            ${opt}
          </label>
        `).join('')}
      </div>
    `;
}

// Update buttons
function updateButtons() {
    prevBtn.disabled = currentIndex === 0;
    if (currentIndex === allQuestions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
}

// Save answer
function saveAnswer() {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (selected) {
        userAnswers[currentIndex] = parseInt(selected.value);
    }
}

// Next button click
nextBtn.addEventListener('click', () => {
    saveAnswer();
    if (currentIndex < allQuestions.length - 1) {
        currentIndex++;
        renderQuestion(currentIndex);
        updateButtons();
        updateProgress();
    }
});

// Previous button click
prevBtn.addEventListener('click', () => {
    saveAnswer();
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion(currentIndex);
        updateButtons();
        updateProgress();
    }
});

// Submit quiz
submitBtn.addEventListener('click', () => {
    saveAnswer();
    submitQuiz();
    callapi()
});
const callapi = async () => {
    const totalTime = 35 * 60;
    const timeUsed = totalTime - timeLeft;

    const a = await axios.post("http://localhost:8080/", {
        uname: userName,
        email: useremail,
        score: userscore,
        time: timeUsed  // send actual seconds used
    });
    console.log(a);

}
async function submitQuiz() {
    if (quizSubmitted) return;
    quizSubmitted = true;
    clearInterval(timerInterval);

    // Calculate score
    let score = 0;
    allQuestions.forEach((q, i) => {
        if (userAnswers[i] === q.answer) score++;
    });

    score -= penalties; // Deduct penalties
    if (score < 0) score = 0;

    questionContainer.innerHTML = "";
    progress.textContent = "";
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'none';

    scoreDisplay.style.display = 'block';
    userscore = score
    scoreDisplay.innerHTML = `

      <h2>Quiz Completed!</h2>
      <p>Your Score: <strong>${score} / 30</strong></p>
      <p>Penalties for Alt+Tab: <strong>${penalties}</strong> marks deducted</p>
      <p>Thank you for participating, ${userName}!</p>
    `;
    await callapi()
}

// Progress
function updateProgress() {
    progress.textContent = `Question ${currentIndex + 1} of 30`;
}

// Alt+Tab detection and penalty (losing focus)
window.addEventListener('blur', () => {
    if (!quizSubmitted) {
        penalties++;
        penaltyEl.textContent = `Alt+Tab Penalties: ${penalties}`;
        // Deduct 1 mark per alt+tab (done in submit)
    }
});

// On user form submit
let userName = '';
userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const enroll = document.getElementById('enroll').value.trim();
    const email = document.getElementById('email').value.trim();
    useremail = email

    // Basic validation
    if (!name || !enroll || !email) {
        alert('Please fill all fields correctly.');
        return;
    }

    userName = name;

    homePage.classList.add('hidden');
    quizPage.classList.remove('hidden');
    welcomeMsg.textContent = `Welcome, ${userName}! Good luck on your SQL Quiz.`;
    updateProgress();
    renderQuestion(0);
    updateButtons();
    startTimer();
});
