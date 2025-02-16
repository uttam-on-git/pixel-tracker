export const ensureAuthenticated = (request, response, next) => {
    if (request.isAuthenticated()) {
      return next();
    }
    response.status(401).json({ error: "Not authenticated" });
}