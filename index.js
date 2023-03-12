import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import {
  registerValitdation,
  loginValitdation,
  postCreateValitdation,
} from "./validations.js";

import { UserController, PostController } from "./controllers/index.js";
import { checkAuth, handleValidationErrors } from "./utils/index.js";

mongoose.set("strictQuery", false);
mongoose
  .connect(
    `mongodb+srv://waytonine:admin@cluster0.ebwrhrh.mongodb.net/blog?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("DB ok");
  })
  .catch((err) => {
    console.log("DB not ok", err);
  });

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.post(
  "/auth/login",
  loginValitdation,
  handleValidationErrors,
  UserController.login
);
app.post(
  "/auth/register",
  registerValitdation,
  handleValidationErrors,
  UserController.register
);
app.get("/auth/me", checkAuth, UserController.getMe);

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get("/posts", PostController.getAll);
app.get("/posts/:id", PostController.getOne);

app.post(
  "/posts",
  checkAuth,
  postCreateValitdation,
  handleValidationErrors,
  PostController.create
);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValitdation,
  handleValidationErrors,
  PostController.update
);

app.listen(4444, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Hello World!");
});
