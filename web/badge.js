import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  badgeName: {
    type: String,
    required: true
  },
  badgeIcon: {
    type: Buffer,
    required: true
  },
  isEnabled: {
    type: Boolean,
    default: true
  }
});

const Badge = mongoose.model('TrustBadge', badgeSchema);
export default Badge; // ES6 export