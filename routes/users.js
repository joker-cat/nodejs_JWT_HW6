const express = require("express");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const User = require("../model/UserModel");
const appError = require("../service/appError");
const handErrorAsync = require("../service/handErrorAsync");
const { sendJWT, isAuth } = require("../module/statusHandles");
const userRouter = express.Router();

// userRouter.get("/user", handErrorAsync(async (req, res, next) => {
//   const data = await User.find();
//   resSuccessWrite(res, 200, data);
// }
// ));

// 註冊
userRouter.get("/sign_up", handErrorAsync(async (req, res, next) => {
  let { name, email, password, confirmPassword } = req.body;
  if (name || email || password || confirmPassword) return next(appError(400, "請確實填寫資訊", next));
  if (password.trim() !== confirmPassword.trim()) return next(appError(400, "密碼不一致！", next));
  const validateName = validator.isEmpty(name.trim());
  if (validateName) return next(appError(400, "名稱未填寫"));
  const validateEmail = validator.isEmail(email.trim());
  if (!validateEmail) return next(appError(400, "信箱格式錯誤"));
  const validatePsd = validator.isByteLength(password.trim(), { min: 6, max: 10 });
  if (!validatePsd) return next(appError(400, "密碼需介於 6-10 字元之間"));

  //信箱是否註冊過
  const user = await User.findOne({ email });
  if (user) return next(appError(400, "信箱已註冊過"));

  //通過驗證後，將密碼加密
  password = await bcrypt.hash(password, 12);
  //建立使用者
  const data = await User.create({ name, email, password });

  sendJWT(data, 201, res);
}
));

// 登入
userRouter.post("/sign_in", handErrorAsync(async (req, res, next) => {
  let { email, password } = req.body;
  const validateEmail = validator.isEmpty(email.trim());
  if (validateEmail) return next(appError(400, "郵件未填寫"));
  const validatePsd = validator.isEmail(password.trim());
  if (validatePsd) return next(appError(400, "密碼未填寫"));

  // password原本為隱藏，透過select('+password')顯示取得
  const user = await User.findOne({ email }).select('+password');
  // 輸入密碼與雜湊密碼比對
  const auth = await bcrypt.compare(password, user.password);
  if (!auth) return next(appError(400, "密碼錯誤"));

  sendJWT(user, 201, res);
}
));

userRouter.post("/updatePassword", isAuth, handErrorAsync(async (req, res, next) => {
  let { email, password } = req.body;
  const validateEmail = validator.isEmpty(email.trim());
  if (validateEmail) return next(appError(400, "郵件未填寫"));
  const validatePsd = validator.isEmail(password.trim());
  if (validatePsd) return next(appError(400, "密碼未填寫"));

  // password原本為隱藏，透過select('+password')顯示取得
  const user = await User.findOne({ email }).select('+password');
  // 輸入密碼與雜湊密碼比對
  const auth = await bcrypt.compare(password, user.password);
  if (!auth) return next(appError(400, "密碼錯誤"));

  sendJWT(user, 201, res);
}
));

// POST：{url}/users/sign_up：註冊
// POST：{url}/users/sign_in：登入
// POST：{url}/users/updatePassword: 重設密碼
// GET：{url}/users/profile: 取得個人資料，需設計 isAuth middleware。
// PATCH：{url}/users/profile: 更新個人資料，需設計 isAuth middleware

module.exports = userRouter;
