import sponsorService from "../services/sponsor.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import HTTP_STATUS from "../constants/httpStatus.js";

const options = (req) => ({ page: req.query.page, limit: req.query.limit });
const published = asyncHandler(async (req, res) =>
  ApiResponse.success(
    res,
    await sponsorService.listPublished(options(req)),
    "Sponsors fetched successfully.",
  ),
);
const all = asyncHandler(async (req, res) =>
  ApiResponse.success(
    res,
    await sponsorService.listAll(options(req)),
    "Sponsors fetched successfully.",
  ),
);
const byId = asyncHandler(async (req, res) =>
  ApiResponse.success(
    res,
    { sponsor: await sponsorService.getById(req.params.id) },
    "Sponsor fetched successfully.",
  ),
);
const create = asyncHandler(async (req, res) =>
  ApiResponse.success(
    res,
    { sponsor: await sponsorService.create(req.body, req.user.id) },
    "Sponsor created successfully.",
    HTTP_STATUS.CREATED,
  ),
);
const update = asyncHandler(async (req, res) =>
  ApiResponse.success(
    res,
    {
      sponsor: await sponsorService.update(
        req.params.id,
        req.body,
        req.user.id,
      ),
    },
    "Sponsor updated successfully.",
  ),
);
const remove = asyncHandler(async (req, res) => {
  await sponsorService.remove(req.params.id);
  return ApiResponse.success(res, null, "Sponsor deleted successfully.");
});

export default Object.freeze({ published, all, byId, create, update, remove });
