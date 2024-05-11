const express = require("express");
const userRouter = express.Router();
const { resSuccessWrite } = require("../module/resModule");
const User = require("../model/UserModel");
const handErrorAsync = require("../service/handErrorAsync");

userRouter.get("/user", handErrorAsync(async (req, res, next) => {
  const data = await User.find();
  resSuccessWrite(res, 200, data);
}
));

module.exports = userRouter;
