// models/User.js
import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";

const COLLECTION_NAME = "users";

export class User {
  /* Collection */

  static getCollection() {
    return getDB().collection(COLLECTION_NAME);
  }

  /* Helpers */

  static _defaultPreferences() {
    return {
      favoriteCategories: [],
      priceRange: { min: 0, max: 5000 },
      preferredBrands: [],
      notifications: true,
    };
  }

  static _transform(user) {
    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      passwordHash: user.passwordHash,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /* Queries */

  static async findByEmail(email) {
    const user = await this.getCollection().findOne({
      email: email.toLowerCase().trim(),
    });
    return this._transform(user);
  }

  static async findById(id) {
    const user = await this.getCollection().findOne({
      _id: new ObjectId(id),
    });

    return this._transform(user);
  }

  static removePassword(user) {
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }

  /* Create */

  static async create({ email, passwordHash, name = "" }) {
    const now = new Date();

    const userDoc = {
      email: email.toLowerCase().trim(),
      passwordHash,
      name,
      avatar: "/placeholder.svg",
      preferences: this._defaultPreferences(),
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.getCollection().insertOne(userDoc);

    return this._transform({
      _id: result.insertedId,
      ...userDoc,
    });
  }

  /* Update profile */

  static async updateProfile(id, updates) {
    const allowedFields = ["name", "avatar"];
    const safeUpdates = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        safeUpdates[key] = updates[key];
      }
    }

    if (Object.keys(safeUpdates).length === 0) return null;

    safeUpdates.updatedAt = new Date();

    const result = await this.getCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: safeUpdates },
      { returnDocument: "after" }
    );

    return this._transform(result.value);
  }

  /* Update preferences */

  static async updatePreferences(id, preferences) {
    const updates = {
      preferences: {
        ...this._defaultPreferences(),
        ...preferences,
      },
      updatedAt: new Date(),
    };

    const result = await this.getCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    return this._transform(result.value);
  }

  /* Password helpers */

  static async getPasswordHashByEmail(email) {
    return await this.getCollection().findOne(
      { email: email.toLowerCase().trim() },
      { projection: { passwordHash: 1 } }
    );
  }

  static async updatePassword(id, passwordHash) {
    await this.getCollection().updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          passwordHash,
          updatedAt: new Date(),
        },
      }
    );
  }

  /* Delete */

  static async deleteById(id) {
    return await this.getCollection().deleteOne({
      _id: new ObjectId(id),
    });
  }
}
