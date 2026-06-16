function validateSchema(schema, source = "body") {
  return async function validateRequest(req, res, next) {
    try {
      const validated = await schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (source === "query") {
        req.validatedQuery = validated;
      } else if (source === "params") {
        req.params = validated;
      } else if (source === "body") {
        req.body = validated;
      } else if (source === "params") {
        req.params = validated;
      }

      next();
    } catch ({ errors }) {
      return res.status(400).json(errors);
    }
  };
}

module.exports = {
  validateSchema,
};
