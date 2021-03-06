const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

// post route using async await
/*
router.post('/', async (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const tasks = [];
  try {
    const project = await Project.create({
      title,
      description,
      tasks
    });
    res.status(201).json(project);

  } catch (err) {
    res.json(err);
  }
});
*/

router.post("/", (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const imageUrl = req.body.imageUrl;
  const number = req.body.number;
  const github = req.body.github;
  const heroku = req.body.heroku;
  const contributors = req.body.contributors;
  const userId = req.user._id;
  //console.log(userId);

  Project.create({
    title,
    description,
    imageUrl,
    number,
    github,
    heroku,
    contributors,
    user: userId,
  })
    .then((project) => {
      //console.log(project);
      User.findByIdAndUpdate(userId, {
        $push: { projects: project.id },
      }).then((project) => {
        res.status(201).json(project);
      });
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/", (req, res) => {
  Project.find()
    .populate("contributors")
    .populate("user")
    .then((projects) => {
      res.status(200).json(projects);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/:id", (req, res) => {
  // check if req.params.id is valid, if not respond with a 4xx status code
  Project.findById(req.params.id)
    .populate("contributors")
    .populate("user")
    .then((project) => {
      if (!project) {
        res.status(404).json(project);
      } else {
        res.json(project);
      }
    })
    .catch((err) => {
      res.json(err);
    });
});

router.put("/:id", (req, res) => {
  const { title, description, imageUrl, number, github, heroku } = req.body;
  //console.log(req.params, req.body);
  Project.findByIdAndUpdate(
    req.params.id,
    { title, description, imageUrl, number, github, heroku },
    // { new: true } ensures that we are getting the updated document in the .then callback
    { new: true }
  )
    .then((project) => {
      //console.log(project);
      res.status(200).json(project);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.delete("/:id", (req, res) => {
  // delete the project
  Project.findByIdAndDelete(req.params.id)
    .then((project) => {
      // Deletes all the documents in the Task collection where the value for the `_id` field is present in the `project.tasks` array

      return Task.deleteMany({ _id: { $in: project.tasks } }).then(() => {
        res.status(200).json({ message: "ok" });
      });
    })
    .catch((err) => {
      res.json(err);
    });
});

module.exports = router;
