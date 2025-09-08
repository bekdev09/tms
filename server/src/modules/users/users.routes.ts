// import { Router } from "express";
// import * as userController from "./user.controller";
// import { authenticate } from "../../middlewares/auth.middleware";

// const router = Router();

// // Self service
// router.get("/me", authenticate(), userController.getProfile);
// router.put("/me", authenticate(), userController.updateProfile);

// // Admin/Manager
// router.get("/", authenticate(["ADMIN", "MANAGER"]), userController.getUsers);
// router.get("/:id", authenticate(["ADMIN", "MANAGER"]), userController.getUserById);
// router.post("/", authenticate(["ADMIN"]), userController.createUser);
// router.put("/:id", authenticate(["ADMIN"]), userController.updateUser);
// router.delete("/:id", authenticate(["ADMIN"]), userController.deleteUser);

// export default router;
