const express = require("express");

// users array

let users = [
  {
    id: 1,
    name: "Frodo Baggins",
    chores: [
      {
        id: 1,
        description: "take the ring to Mordor",
        notes: "make your way to Mount Doom",
        assignedTo: 1, // the id of Frodo,
        completed: true,
      },
      {
        id: 2,
        description: "destroy the ring",
        notes: "cast the ring into the fire inside Mount Doom",
        assignedTo: 1,
        completed: false,
      },
    ],
  },
];

// logger
const morgan = require("morgan");
// http
const helmet = require("helmet");
// cors
const cors = require("cors");

const server = express();

// use json
server.use(express.json());

// query

server.get("/", (req, res) => {
  const queryParameters = req.query;

  res.status(200).json(queryParameters);
});

// // require the 2 routes
// const userRoutes = require("./users/userRouter");
// const postRoutes = require("./posts/postRouter");

// get
// get users
server.get("/users", (req, res) => {
  res.status(200).json(users);
  // res.json(users)
});

// get chores
server.get("/:userId/chores", (req, res) => {
  // store userId from url
  const userId = parseInt(req.params.userId);
  // store user that has userId
  const foundUser = users.find(user => {
    console.log("user", user);
    return user.id === userId;
  });
  // if founduser exists..
  if (foundUser) {
    // if chores exists, return chores
    if (foundUser.chores) {
      res.status(200).json(foundUser.chores);
      // if chores does not exist, return empty array
    } else {
      res.status(500).json([]);
    }
  }
  // if founduser doesn't exist, it means no user had the user Id
  else {
    res.status(400).json({ message: "User ID doesn't exist" });
  }
});

// post
// post new user
// add validateUser to ensure user added a name
server.post("/users", validateUser, (req, res) => {
  // create a variable that is one more than the last id in the users array
  const latestUserId = users[users.length - 1].id + 1;
  // store the new user into a var and add an id that auto increments
  const newUser = { id: latestUserId, ...req.body };
  // add the new user to our users array
  users.push(newUser);
  // send a 200 response with our updated users array
  res.status(200).json(users);
});

// post new chore
server.post("/chores", validateChore, (req, res) => {
  // store the id from the chore's assignedId
  const assignedId = req.body.assignedTo;
  // store user that has userId
  const foundUser = users.find(user => user.id === assignedId);
  // if founduser exists..
  if (foundUser) {
    // create a variable that is one more than the latest chores ID
    const latestChoreId =
      foundUser.chores.length > 0
        ? foundUser.chores[foundUser.chores.length - 1].id + 1
        : 1;
    console.log(latestChoreId);
    // create the newChore that we'll add to that user's chores array
    const newChore = {
      // fill out the newChore with the stuff our FE sent us..
      id: latestChoreId,
      description: req.body.description,
      //? optional, maybe you can make it that by default its an empty string?
      notes: req.body.notes,
      assignedTo: assignedId,
      // competed is either what the FE sent us, or by default false
      completed: req.body.completed || false,
    };
    // check to see if there is an existing chores array under that user, if they do, add it to the user's chores array
    if (foundUser.chores) {
      foundUser.chores = [...foundUser.chores, newChore];
      res.status(200).json(users);
    } // otherwise, create one and add the the new chore object to it
    else {
      foundUser.chores = [newChore];
      res.status(200).json(users);
    }
  }
  // if founduser doesn't exist, it means no user had the user Id, or a wrong assignedTo ID was given
  else {
    res.status(400).json({
      message: "User ID doesn't exist, please input a valid assignedTo ID",
    });
  }
});

// update
// update chore
server.put("/users/:userId/chores/:choreId", validateChore, (req, res) => {
  // store userId and choreId from url
  const userId = parseInt(req.params.userId);
  const choreId = parseInt(req.params.choreId);
  const { id, description, notes, assignedTo, completed } = req.body;
  // find the updating user
  const foundUser = users.find(user => user.id === userId);
  // find the updating chore
  const updatingChore = foundUser.chores.find(chore => chore.id === choreId);
  // if updating chore exists
  if (updatingChore) {
    // if description was given, change it
    if (description) {
      updatingChore.description = description;
    }
    // if notes was given, change it
    if (notes) {
      updatingChore.notes = notes;
    }
    // if assignedTo ID was given, change it
    if (assignedTo) {
      updatingChore.assignedTo = assignedTo;
    }
    // if completed is false, change it
    if (completed === false) {
      updatingChore.completed = false;
    }
    // if completed is true, change it
    if (completed === true) {
      updatingChore.completed = true;
    }
    // return the updated users array
    res.status(200).json(users);
    // if updatinguser doesn't exist, it means a user with the given userId doesn't exist, so send message
  } else {
    res.status(404).json({ message: "userId or choreId does not exist" });
  }
});

// delete
// delete chore
server.delete("/users/:userId/chores/:choreId", (req, res) => {
  // store userId and choreId from url
  const userId = parseInt(req.params.userId);
  const choreId = parseInt(req.params.choreId);
  // if user was found
  const foundUser = users.find(user => user.id === userId);
  // chore to delete
  const deletingChore = foundUser.chores.find(chore => chore.id === choreId);
  // if deletingChore exists / was found.. / user has no chores
  if (deletingChore) {
    foundUser.chores = foundUser.chores.filter(chore => chore.id != choreId);
    res.status(200).json(users);
  } else {
    // else it means the deletingchore doesn't exist
    res
      .status(404)
      .json({ message: "A chore with that choreID doesn't exist" });
  }
});

//custom middleware

// function logger(req, res, next) {}

// middleware
server.use(morgan("dev"));
server.use(helmet());
server.use(cors());

// custom middlewares
// validate user is a normal function so it gets hoisted
function validateUser(req, res, next) {
  // destructure name
  const { name } = req.body;
  // if name exists, it means the user sent us a name
  if (name) {
    // proceed to next middleware
    next();
    // if they didn't, it means they didn't send us a name
  } else {
    res.status(404).json({ message: "Please input a name" });
  }
}

function validateChore(req, res, next) {
  // destructure description and assignedTo
  const { description, assignedTo } = req.body;
  // check to see if they exist
  if (description && assignedTo) {
    // proceed to next middleware
    next();
  }
  // otherwise send them an message to input them
  else {
    res
      .status(404)
      .json({ message: "Please input both a description and an assigned ID" });
  }
}

// server.use("/users", userRoutes);
// server.use("/posts", postRoutes);

module.exports = server;
