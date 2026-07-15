"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("../modules/audit/audit.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.requireAuth, (0, role_middleware_1.allowRoles)('SUPERADMIN'), audit_controller_1.listAuditLogsController);
exports.default = router;
