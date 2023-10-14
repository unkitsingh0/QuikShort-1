import mongoose from "mongoose";

const connectionToDatabase = (uri) => {
  mongoose
    .connect(uri)
    .then((e) => {
      console.log("connected to database");
    })
    .catch((error) => {
      console.log("Something went worng");
      console.log(
        "------------------------------------------------------------------------"
      );
      console.log(error.message);
    });
};

export default connectionToDatabase;
