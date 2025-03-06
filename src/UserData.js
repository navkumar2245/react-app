import { Container, Stack, Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

function UserData() {
  const [questionsData, setQuestionsData] = useState([]);
  const [userData, setUserData] = useState({});
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [answersData, setAnswersData] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [questionAnsweredLeft, setQuestionAnsweredLeft] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [startQuestion, setStartQuestion] = useState(null);

  useEffect(() => {
    if (questionAnsweredLeft === 0) {
      return;
    }
    if (timeLeft === 0) {
      onNextQuestion();
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [questionAnsweredLeft, timeLeft]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await axios.get("http://localhost:3030/user");
        setUserData(userData.data);
        const questionData = await axios.get("http://localhost:3030/questions");
        setQuestionsData(questionData.data);
        const answerData = await axios.get("http://localhost:3030/answers");
        setAnswersData(answerData.data);
        const startData = await axios.get("http://localhost:3030/start");
        const firstQuestion = questionData.data.find(
          (ques) =>
            ques.id.toString() === startData.data.firstQuestionId.toString()
        );
        setCurrentQuestion(firstQuestion);
        setQuestionAnsweredLeft(startData.data.numberOfQuestions);
        setTotalQuestions(startData.data.numberOfQuestions);
        setStartQuestion(firstQuestion);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  const getBoxWithBorder = (message, padding, borderRadius, index) => {
    return (
      <Box
        sx={{
          p: padding,
          borderRadius: borderRadius,
          height: 40,
          mb: 2,
          border: "1px solid black",
          textAlign: "center",
        }}
      >
        {message}
      </Box>
    );
  };

  const onNextQuestion = (index) => {
    const answerOfQuestion = answersData.find(
      (ans) => ans.id.toString() === currentQuestion.id.toString()
    );
    if (answerOfQuestion.correctAnswer === index) {
      setScore(score + 1);
    }
    const nextQuestion = questionsData.find(
      (ques) => ques.id.toString() === answerOfQuestion.nextQuestion?.toString()
    );
    setQuestionAnsweredLeft(questionAnsweredLeft - 1);
    setCurrentQuestion(nextQuestion);
    setTimeLeft(60);
  };

  const getFinalResult = () => {
    const percentage = score / totalQuestions;
    if (percentage < 0.5) {
      return "Try Again and improve";
    } else if (percentage > 0.9) {
      return "Way to go Champ!!";
    } else {
      return "Nice attempt but try again";
    }
  };

  const resetAll = () => {
    setQuestionAnsweredLeft(totalQuestions);
    setTimeLeft(60);
    setCurrentQuestion(startQuestion);
    setScore(0);
  };

  const getButtonWithBorder = (message, index) => {
    return (
      <Button
        onClick={() => onNextQuestion(index)}
        sx={{
          p: 3,
          borderRadius: 2,
          height: 20,
          mb: 2,
          border: "1px solid black",
          textAlign: "center",
          color: "black",
        }}
      >
        {message}
      </Button>
    );
  };
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h5" sx={{ mb: 4, textAlign: "center" }}>
        {userData?.name}", want to be millionaire?"
      </Typography>
      <Stack direction="row" justifyContent="space-between">
        {getBoxWithBorder(
          timeLeft ? `Time left: ${timeLeft}` : "Time ELapsed",
          5,
          3
        )}
        {getBoxWithBorder(`Score: ${score}`, 5, 3)}
      </Stack>
      {currentQuestion && (
        <Stack>
          {getBoxWithBorder(currentQuestion.title, 10, 10)}
          {currentQuestion.answers?.map((option, index) =>
            getButtonWithBorder(option, index)
          )}
        </Stack>
      )}
      <Stack
        sx={{
          p: 10,
          borderRadius: 10,
          height: 40,
          mb: 2,
          border: "1px solid black",
          textAlign: "center",
        }}
      >
        {!questionAnsweredLeft && getFinalResult()}
        <Button onClick={resetAll}>Start Over</Button>
      </Stack>
    </Container>
  );
}

export default UserData;
