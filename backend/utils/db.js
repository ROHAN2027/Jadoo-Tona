import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async()=>{
  try {
    await mongoose.connect(process.env.MONGO_URL).then((data)=>{
      console.log(`Mongodb connect with :${data.connection.host}`)
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

export default connectDB; // Changed to default export