(function(){
  
  /**
   * Shuffle questions
   * @param {Array} array of items
   */
  function shuffleQuestions(array){
    for(let i = array.length - 1; i > 0; i--){

      const j = Math.floor(Math.random() * i)
      const temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
    return array;
  }
  /**
   * build quiz 
   */
  function buildQuiz(){
    // variable to store the HTML output
    const output = [];

    // for each question...
    quizQuestions.forEach(
      (currentQuestion, questionNumber) => {
        // list of answers to display
        const answers = [];
        // questions shuffled
        currentQuestion.answers = shuffleQuestions([currentQuestion.correct_answer, ...currentQuestion.incorrect_answers]);
        // and for each available answer...
        for(index in currentQuestion.answers){
          // ...add an HTML radio button
          answers.push(
            `<label>
              <input type="radio" name="question${questionNumber}" value="${index}">
              ${index} :
              ${currentQuestion.answers[index]}
            </label>`
          );
        }
        // add this question and its answers to the output
        output.push(
          `<div class="slide">
            <div class="question"> ${currentQuestion.question} </div>
            <div class="question-description">
              <div class="question-category p-2">Category: <span class="badge category">${currentQuestion.category}</span></div>
              <div class="question-difficulty p-2">Level: <span class="badge level">${currentQuestion.difficulty}</span></div>
            </div>
            <div class="answers"> ${answers.join("")} </div>
          </div>`
        );
      }
    );

    //  output 
    quizContainer.innerHTML = output.join('');
  }

  /**
   * display user results
   */
  function displayResults(){
    // timer
    clearInterval(interval); // clear
    // disable submit button
    submitButton.disabled = true;
    // get all answers container
    const answerContainers = quizContainer.querySelectorAll('.answers');

    // track correct answer number
    let numCorrect = 0;

    quizQuestions.forEach( (currentQuestion, questionNumber) => {

      // find selected answer
      const answerContainer = answerContainers[questionNumber];
      const selector = `input[name=question${questionNumber}]:checked`;
      const userAnswer = (answerContainer.querySelector(selector) || {}).value;

      // if answer is correct
      if(currentQuestion.answers[userAnswer] === currentQuestion.correct_answer){
        numCorrect++;
      }
      
    });

    resultsContainer.innerHTML = `
      <hr>
      <div>
        <h3>Your Scrore: ${numCorrect} out of ${quizQuestions.length}</h3>
      </div>`;
  }


  function displayQuestion(n) {
    if(questionsToDisplay.length <= 0) return;
    // clear interval 
    clearInterval(interval);
    // run watcher
    stopWatch(timeLeft, counterContainer);
    questionsToDisplay[currentQuestionToDisplay].classList.remove('active-slide');
    questionsToDisplay[n].classList.add('active-slide');
    currentQuestionToDisplay = n;
    
    if(currentQuestionToDisplay === questionsToDisplay.length-1){
      nextButton.style.display = 'none';
      submitButton.style.display = 'inline-block';
    }
    else{
      nextButton.style.display = 'inline-block';
      submitButton.style.display = 'none';
    }
  }
  /**
   * show next question
   */
  function showNextQuestion() {
    displayQuestion(currentQuestionToDisplay + 1);
  }
  /**
   * display timer
   * @param {number} duration 
   * @param {HTMLElement} counterContainer 
   */
  function stopWatch(duration, counterContainer){
    var intf = duration;
    var distance = duration, minutes, seconds;
    interval = setInterval(function() {

      minutes = parseInt(distance / 60, 10)
      seconds = parseInt(distance % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      counterContainer.innerHTML = "Remaining time: "+ minutes + ":" + seconds ;

      if (--distance < 0) {
        if(currentQuestionToDisplay === questionsToDisplay.length-1){
          clearInterval(interval);
          counterContainer.innerHTML = 'EXPIRED';
          isGameEnded = true;
          submitButton.click();
        }else{
          nextButton.click();
        }
      }
    }, 1000);
  }

  /**
   * Load questions from API
   * @returns Promise<Any>
   */
  async function loadData() { 
    isDataLoading = true;
    quizContainer.innerHTML = `<h2> Data is loading... Please wait. </h2>`;
    let response = await fetch(`https://opentdb.com/api.php?amount=5&type=multiple`)
    let data = await response.json()
    return data;
  };

  function handlePaginationEvents(){
    // Pagination
    nextButton = document.getElementById("next");
    questionsToDisplay =document.querySelectorAll(".slide")
    counterContainer = document.getElementById("counter");
 
  // Event listeners
    submitButton.addEventListener('click', displayResults);
    nextButton.addEventListener("click", showNextQuestion);
  }
  /**
   * start quiz
   */
  function playQuiz(){
    try {
      if(quizQuestions.length>0){
        // build the quiz
        buildQuiz();
        // set events
        handlePaginationEvents();
        // disppkay current question
        displayQuestion(currentQuestionToDisplay);
      }
    } catch (error) {
      // hanler error
      console.error(`Error throw: ${error}`);
    }
  }
  // Variables
  let isGameEnded = false;
  // timer 
  let interval = 0;
  var timeLeft = 5; // In seconds
  // index of the current question to display
  let currentQuestionToDisplay = 0;
  // quiz container
  const quizContainer = document.getElementById('quiz');
  // result container
  const resultsContainer = document.getElementById('results');
  // submit button
  const submitButton = document.getElementById('submit');

  // quiz questions output
  let questionsToDisplay = [];
  // next button
  let nextButton = null;
  // timer container
  let counterContainer = null;
  // quiz questions
  let quizQuestions = [];

  
  // first load data
  loadData().then((response) => {
    isDataLoading = false;
    // updates question;
    quizQuestions = response.results;
    playQuiz();    
  });

})();
