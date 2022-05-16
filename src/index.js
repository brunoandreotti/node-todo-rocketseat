const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(400).json({ error: "User not found exists!" });
  }

  req.user = user;

  next();
}

app.post("/users", (req, res) => {
  const { name, username } = req.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  const userAlreadyExists = users.find((user) => user.username === username);

  if (userAlreadyExists) {
    return res.status(400).json({ error: "User already exists!" });
  }

  users.push(user);

  return res.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (req, res) => {
  const user = req.user;

  return res.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;

  const user = req.user;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return res.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;
  const { id } = req.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Todo not found!" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return res.status(200).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Todo not found!" });
  }

  todo.done = true;

  return res.status(200).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found!" });
  }

  const deletedTodo = user.todos.splice(todoIndex, 1);

  return res.status(204).json(deletedTodo);
});

module.exports = app;
