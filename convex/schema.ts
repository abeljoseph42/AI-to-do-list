import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
    todos: defineTable({
        title: v.string(),
        description: v.string(),
        completed: v.boolean(),
        userID: v.string(),
    }).index("by_user_id", ["userID"]),
});