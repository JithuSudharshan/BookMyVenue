import mongoose from "mongoose";
import Admin from "./src/models/adminModel.js";

await mongoose.connect(
    "mongodb+srv://jithuspillai2621_db_user:CJWY2RxDGfj4lfct@bookmyvenue.oybyayz.mongodb.net/?appName=BookMyVenue"
);


await Admin.create({
    name: "Super Admin",
    email: "admin@bookmyvenue.com",
    password: "Admin@123", // Will be hashed automatically
    role: "super_admin",
    status: "active",
});

console.log("✅ Admin inserted successfully");

await mongoose.disconnect();
process.exit(0);