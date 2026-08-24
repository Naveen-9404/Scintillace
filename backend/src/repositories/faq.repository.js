import Faq from "../models/Faq.js";

const faqRepository = Object.freeze({
  create: (data) => Faq.create(data),
  findById: (id) => Faq.findById(id).lean().exec(),
  findAll: ({ filter = {}, page = 1, limit = 20 } = {}) =>
    Faq.find(filter)
      .sort({ category: 1, displayOrder: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec(),
  count: (filter = {}) => Faq.countDocuments(filter).exec(),
  updateById: (id, data) =>
    Faq.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .lean()
      .exec(),
  deleteById: (id) => Faq.findByIdAndDelete(id).lean().exec(),
});

export default faqRepository;
