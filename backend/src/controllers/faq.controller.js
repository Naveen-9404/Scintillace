import faqService from "../services/faq.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import HTTP_STATUS from "../constants/httpStatus.js";

const options = (req) => ({ page: req.query.page, limit: req.query.limit });
const published = asyncHandler(async (req, res) =>
  ApiResponse.success(
    res,
    await faqService.listPublished(options(req), req.query.category),
    "FAQs fetched successfully.",
  ),
);
const all = asyncHandler(async (req, res) =>
  ApiResponse.success(
    res,
    await faqService.listAll(options(req)),
    "FAQs fetched successfully.",
  ),
);
const byId = asyncHandler(async (req, res) =>
  ApiResponse.success(
    res,
    { faq: await faqService.getById(req.params.id) },
    "FAQ fetched successfully.",
  ),
);
const create = asyncHandler(async (req, res) =>
  ApiResponse.success(
    res,
    { faq: await faqService.create(req.body, req.user.id) },
    "FAQ created successfully.",
    HTTP_STATUS.CREATED,
  ),
);
const update = asyncHandler(async (req, res) =>
  ApiResponse.success(
    res,
    { faq: await faqService.update(req.params.id, req.body, req.user.id) },
    "FAQ updated successfully.",
  ),
);
const remove = asyncHandler(async (req, res) => {
  await faqService.remove(req.params.id);
  return ApiResponse.success(res, null, "FAQ deleted successfully.");
});

export default Object.freeze({ published, all, byId, create, update, remove });
