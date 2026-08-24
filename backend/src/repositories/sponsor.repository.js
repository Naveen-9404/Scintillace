import Sponsor from "../models/Sponsor.js";

const sponsorRepository = Object.freeze({
  create: (data) => Sponsor.create(data),
  findById: (id) => Sponsor.findById(id).lean().exec(),
  findAll: ({ filter = {}, page = 1, limit = 20 } = {}) =>
    Sponsor.find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec(),
  count: (filter = {}) => Sponsor.countDocuments(filter).exec(),
  updateById: (id, data) =>
    Sponsor.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .lean()
      .exec(),
  deleteById: (id) => Sponsor.findByIdAndDelete(id).lean().exec(),
});

export default sponsorRepository;
