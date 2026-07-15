"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const prisma_1 = require("./lib/prisma");
const start = async () => {
    try {
        await prisma_1.prisma.$connect();
        app_1.app.listen(env_1.env.PORT, () => {
            console.log(`Server running on port ${env_1.env.PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
};
start();
