import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260222023048 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "actor" ("id" text not null, "name" text not null, "category" text not null, "price" integer not null, "rating" integer not null default 5, "image_url" text not null, "seller_id" text not null, "tier" text check ("tier" in ('gold', 'silver', 'bronze', 'none')) not null default 'none', "description" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "actor_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_actor_seller_id" ON "actor" ("seller_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_actor_deleted_at" ON "actor" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "actor" cascade;`);
  }

}
