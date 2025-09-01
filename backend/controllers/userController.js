
import userModels from "../models/userModels.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModels.find({}).select("-password -answer"); 
    // password আর answer বাদ দিয়ে শুধু দরকারি data পাঠাব
    res.status(200).send({
      success: true,
      message: "All Users Fetched Successfully",
      users,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while getting users",
      error,
    });
  }
};
