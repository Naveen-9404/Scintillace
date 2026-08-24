import mongoose from "mongoose";
import faqRepository from "../repositories/faq.repository.js";
import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

const assertId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError("Invalid FAQ ID.", HTTP_STATUS.BAD_REQUEST);
};
const pageOptions = ({ page = 1, limit = 20 } = {}) => ({
  page: Math.max(1, Number(page) || 1),
  limit: Math.min(100, Math.max(1, Number(limit) || 20)),
});
const list = async (options, filter = {}) => {
  const pagination = pageOptions(options);
  const [faqs, total] = await Promise.all([
    faqRepository.findAll({ ...pagination, filter }),
    faqRepository.count(filter),
  ]);
  return {
    faqs,
    pagination: {
      ...pagination,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
};
const getById = async (id) => {
  assertId(id);
  const faq = await faqRepository.findById(id);
  if (!faq) throw new ApiError("FAQ not found.", HTTP_STATUS.NOT_FOUND);
  return faq;
};

export default Object.freeze({
  listPublished: (options, category) =>
    list(options, { status: "PUBLISHED", ...(category ? { category } : {}) }),
  listAll: (options) => list(options),
  getById,
  create: (data, userId) =>
    faqRepository.create({ ...data, createdBy: userId, updatedBy: userId }),
  update: async (id, data, userId) => {
    await getById(id);
    return faqRepository.updateById(id, { ...data, updatedBy: userId });
  },
  remove: async (id) => {
    await getById(id);
    await faqRepository.deleteById(id);
  },
});
