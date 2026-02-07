export const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error", { error: err.message, stack: err.stack, path: req.path });
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};