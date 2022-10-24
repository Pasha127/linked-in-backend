import e from "cors";
import { Schema, model } from "mongoose";

const experienceDbSchema = new Schema(
  {
    role: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: false },
    description: { type: String, required: true },
    area: { type: String, required: true },
  },
  { timestamps: true }
);

const userDbSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String, required: true },
    title: { type: String, required: true },
    area: { type: String, required: true },
    image: { type: String, required: true },
    username: { type: String, required: true },
    experiences: [experienceDbSchema],
  },
  { timestamps: true }
);

export default model("User", userDbSchema);
