// models/User.js
import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";

const COLLECTION_NAME = "users";

export class User {
  static getCollection() {
    return getDB().collection(COLLECTION_NAME);
  }

  static async findByEmail(email) {
    return await this.getCollection().findOne({
      email: email.toLowerCase().trim(),
    });
  }

  static async findById(id) {
    return await this.getCollection().findOne({
      _id: new ObjectId(id),
    });
  }

  static async create({ email, passwordHash }) {
    const result = await this.getCollection().insertOne({
      email: email.toLowerCase().trim(),
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      _id: result.insertedId,
      email,
      passwordHash,
    };
  }
}
