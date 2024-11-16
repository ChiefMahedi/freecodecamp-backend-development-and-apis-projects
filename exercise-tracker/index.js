const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});


let users = [];
let exercises = [];


const findUserById = (id) => users.find((user) => user._id === id);
const generateId = () => Math.random().toString(36).substring(2, 9);


app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const userId = generateId();
  const newUser = { username, _id: userId };
  users.push(newUser);
  res.json(newUser);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  
  const user = findUserById(_id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const exerciseDate = date ? new Date(date) : new Date();
  if (exerciseDate.toString() === 'Invalid Date') {
    return res.json({ error: 'Invalid date' });
  }

  const newExercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString(),
    _id: user._id,
  };

  exercises.push({ ...newExercise, userId: user._id });

  res.json(newExercise);
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  
  const user = findUserById(_id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let userExercises = exercises.filter((ex) => ex.userId === user._id);

  if (from) {
    const fromDate = new Date(from);
    if (fromDate.toString() !== 'Invalid Date') {
      userExercises = userExercises.filter((ex) => new Date(ex.date) >= fromDate);
    }
  }
  
  if (to) {
    const toDate = new Date(to);
    if (toDate.toString() !== 'Invalid Date') {
      userExercises = userExercises.filter((ex) => new Date(ex.date) <= toDate);
    }
  }

  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  const response = {
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises.map((ex) => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date,
    })),
  };

  res.json(response);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
