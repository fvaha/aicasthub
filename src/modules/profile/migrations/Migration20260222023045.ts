import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260222023045 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "user_profile" drop constraint if exists "user_profile_user_id_unique";`);
    this.addSql(`create table if not exists "user_profile" ("id" text not null, "user_id" text not null, "role" text check ("role" in ('buyer', 'seller')) not null default 'buyer', "phone" text null, "bio" text null, "avatar_url" text null, "company_name" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "user_profile_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_user_profile_user_id_unique" ON "user_profile" ("user_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_user_profile_user_id" ON "user_profile" ("user_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_user_profile_deleted_at" ON "user_profile" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user_profile" cascade;`);
  }

}
