import UserModel from "../models/UserModel.js";
import { CollageData } from "../CollageData.js";

export const StudentRegister = async (req, res) => {
  try {
    //Checking all fields from Frontend
    const { E_no, password } = req.body;
    if (!E_no || !password) {
      return res.status(400).send({
        success: false,
        message: "All fields are require",
      });
    }

    //Checking The Student is in our collage or not
    const collageStudent = CollageData.filter((e) => e.enrollmentNo === E_no);
    if (collageStudent.length === 0) {
      return res.status(401).send({
        success: true,
        message: "You are not a collage student",
      });
    }

    //Checking the student is already exist or not
    const existUser = await UserModel.findOne({ E_no });
    if (existUser) {
      return res.status(500).send({
        success: false,
        message: "User Already existed",
      });
    }

    //Register Student
    const user = await new UserModel({
      name: collageStudent[0].name,
      email: collageStudent[0].email,
      E_no,
      password,
      ph_no: collageStudent[0].ph_no,
    });
    await user.save();
    if (!user) {
      return res.status(500).send({
        success: true,
        message: "User data is not save",
      });
    }
    const token = await user.JWT();

    res.cookie("token", token, {
      httpOnly: true,
    });

    return res.status(200).send({
      success: true,
      message: "User is successfully saved",
      data: {
        user,
      },
    });
  } catch (e) {
    res.status(400).send({
      success: false,
      message: "Sign in Server is Not Working",
    });
    console.log("Error in Register Part", e);
  }
};

//Student Login

export const StudentLogIn = async (req, res, next) => {
  try {
    const { E_no, password } = req.body;

    const user = await UserModel.findOne({ E_no });
    if (!user) {
      return res.status(500).send({
        success: false,
        message: "User not Found",
      });
    }
    const isTrue = await user.comparePassword(password);
    if (!isTrue) {
      return res.status(400).send({
        success: false,
        message: "Wrong Passsword",
      });
    }

    const token = await user.JWT();
    res.cookie("token", token, {
      httpOnly: true,
    });

    user.password = undefined;

    res.status(200).send({
      success: true,
      message: "User is successfully log in",
      user,
    });
  } catch (err) {
    console.log("Error in LogIn Part", err);
    return res.status(400).send({
      success: false,
      message: "LogIn Server is Not Working",
    });
  }
};

//Student Logout

export const StudentLogOut = (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(400).send({
        success: false,
        message: "token  is alredy removed",
      });
    }
    res.cookie("token", token, { maxAge: 0 });
    return res.status(200).send({
      success: true,
      message: "User is successfully signed out",
    });
    // res.status(200);
  } catch (e) {
    console.log("Error in signOut part", e);
    return res.status(400).send({
      success: false,
      message: "Signout Server is Not Working",
    });
  }
};
