import mongoose from "mongoose";
import sponsorRepository from "../repositories/sponsor.repository.js";
import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

const assertId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError("Invalid sponsor ID.", HTTP_STATUS.BAD_REQUEST);
};
const pageOptions = ({ page = 1, limit = 20 } = {}) => ({
  page: Math.max(1, Number(page) || 1),
  limit: Math.min(100, Math.max(1, Number(limit) || 20)),
});
const list = async (options, filter = {}) => {
  const pagination = pageOptions(options);
  const [sponsors, total] = await Promise.all([
    sponsorRepository.findAll({ ...pagination, filter }),
    sponsorRepository.count(filter),
  ]);
  return {
    sponsors,
    pagination: {
      ...pagination,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
};
const getById = async (id) => {
  assertId(id);
  const sponsor = await sponsorRepository.findById(id);
  if (!sponsor) throw new ApiError("Sponsor not found.", HTTP_STATUS.NOT_FOUND);
  return sponsor;
};

export default Object.freeze({
  listPublished: (options) => list(options, { status: "PUBLISHED" }),
  listAll: (options) => list(options),
  getById,
  create: (data, userId) =>
    sponsorRepository.create({ ...data, createdBy: userId, updatedBy: userId }),
  update: async (id, data, userId) => {
    await getById(id);
    return sponsorRepository.updateById(id, { ...data, updatedBy: userId });
  },
  remove: async (id) => {
    await getById(id);
    await sponsorRepository.deleteById(id);
  },
});
