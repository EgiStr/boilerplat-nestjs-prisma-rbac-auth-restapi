-- CreateEnum
CREATE TYPE "ENUM_LOGGER_LEVEL" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL');

-- CreateEnum
CREATE TYPE "ENUM_LOGGER_ACTION" AS ENUM ('LOGIN', 'GET', 'CREATE', 'UPDATE', 'DELETE', 'TEST');

-- CreateEnum
CREATE TYPE "ENUM_SETTING_DATA_TYPE" AS ENUM ('BOOLEAN', 'STRING', 'ARRAY_OF_STRING', 'NUMBER');

-- CreateEnum
CREATE TYPE "ENUM_PERMISSION_GROUP" AS ENUM ('USER', 'ROLE', 'PERMISSION', 'SETTING');

-- CreateEnum
CREATE TYPE "ENUM_ACCESS_FOR" AS ENUM ('SUPER_ADMIN', 'USER', 'AUTHOR');

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "requestId" TEXT,
    "user" TEXT,
    "role" TEXT,
    "apiKey" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT true,
    "accessFor" TEXT,
    "description" TEXT NOT NULL,
    "path" TEXT,
    "tags" TEXT[],
    "params" TEXT NOT NULL DEFAULT '{}',
    "bodies" TEXT NOT NULL DEFAULT '{}',
    "statusCode" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ENUM_SETTING_DATA_TYPE",
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accessFor" "ENUM_ACCESS_FOR" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(25) NOT NULL,
    "group" "ENUM_PERMISSION_GROUP" NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "role" VARCHAR(100) NOT NULL DEFAULT 'USER',
    "password" VARCHAR(255) NOT NULL,
    "passwordExpired" TIMESTAMP(3) NOT NULL,
    "passwordCreated" TIMESTAMP(3) NOT NULL,
    "passwordAttempt" INTEGER NOT NULL DEFAULT 0,
    "signUpDate" TIMESTAMP(3),
    "salt" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "inactivePermanent" BOOLEAN NOT NULL DEFAULT false,
    "inactiveDate" TIMESTAMP(3),
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "blockedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "logs_action_idx" ON "logs"("action");

-- CreateIndex
CREATE INDEX "logs_level_idx" ON "logs"("level");

-- CreateIndex
CREATE UNIQUE INDEX "settings_name_key" ON "settings"("name");

-- CreateIndex
CREATE INDEX "settings_name_idx" ON "settings"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "roles_isActive_name_idx" ON "roles"("isActive", "name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "permissions_code_idx" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "permissions_group_idx" ON "permissions"("group");

-- CreateIndex
CREATE INDEX "permissions_isActive_idx" ON "permissions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_fullName_idx" ON "users"("fullName");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_inactivePermanent_idx" ON "users"("inactivePermanent");

-- CreateIndex
CREATE INDEX "users_blocked_idx" ON "users"("blocked");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_fkey" FOREIGN KEY ("role") REFERENCES "roles"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
