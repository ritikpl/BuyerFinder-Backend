import mongoose from "mongoose";

const connectDB = async () => {
  console.log("MongoDB connection starting...");

  try {
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected:", conn.connection.host);
  } catch (error) {
    console.error("MongoDB ERROR:", error);
  }
};

export default connectDB;