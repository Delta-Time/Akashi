CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "jwt_sub" VARCHAR(255),
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "private_keys" (
    "id" SERIAL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "expired_at" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "apps" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255),
    "code" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "roles" (
    "id" SERIAL PRIMARY KEY,
    "app_id" BIGINT NOT NULL,
    "name" VARCHAR(255),
    "code" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "role_users" (
    "user_id" BIGINT,
    "role_id" BIGINT
);

-- rolesテーブルのapp_idに外部キー制約を追加
ALTER TABLE "roles"
ADD CONSTRAINT fk_app
FOREIGN KEY ("app_id")
REFERENCES "apps"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- role_usersテーブルのrole_idに外部キー制約を追加
ALTER TABLE "role_users"
ADD CONSTRAINT fk_role
FOREIGN KEY ("role_id")
REFERENCES "roles"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;