import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    // ===============================
    // CORE IDENTITY
    // ===============================
    name: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    city: { type: String, trim: true, index: true },

    // ===============================
    // STATE MACHINE (IMPORTANT UPGRADE)
    // ===============================
    status: {
      type: String,
      enum: [
        "new",
        "locked",
        "claimed",
        "assigned",
        "booked",
        "billed",
        "failed",
        "rejected",
      ],
      default: "new",
      index: true,
    },

    // ===============================
    // SCORING ENGINE (AI READY)
    // ===============================
    score: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
      index: true,
    },

    // ===============================
    // MONETIZATION LAYER
    // ===============================
    price: {
      type: Number,
      default: 0,
      index: true,
    },

    paid: {
      type: Boolean,
      default: false,
      index: true,
    },

    billed_at: {
      type: Date,
      default: null,
    },

    // ===============================
    // CONTRACTOR OWNERSHIP SYSTEM
    // ===============================
    assigned_contractor_id: {
      type: String,
      default: null,
      index: true,
    },

    lock_owner: {
      type: String,
      default: null,
      index: true,
    },

    locked_at: {
      type: Date,
      default: null,
    },

    lock_expires_at: {
      type: Date,
      default: null,
      index: true,
    },

    // ===============================
    // IDENTITY + ANTI-DUP SYSTEM
    // ===============================
    dedupeKey: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
    },

    source: {
      type: String,
      default: "direct",
      index: true,
    },

    // ===============================
    // EVENT SORCERY (FULL AUDIT TRAIL)
    // ===============================
    events: [
      {
        type: {
          type: String,
          enum: [
            "created",
            "assigned",
            "claimed",
            "locked",
            "billed",
            "rejected",
          ],
        },
        contractorId: String,
        price: Number,
        city: String,
        source: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ===============================
// INDEXING (CRITICAL FOR SCALE)
// ===============================
LeadSchema.index({ city: 1, status: 1, score: -1 });
LeadSchema.index({ assigned_contractor_id: 1 });
LeadSchema.index({ lock_owner: 1 });
LeadSchema.index({ status: 1, locked_at: 1 });

export default mongoose.models.Lead ||
  mongoose.model("Lead", LeadSchema);