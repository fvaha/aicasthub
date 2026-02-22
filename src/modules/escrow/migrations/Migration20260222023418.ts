import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260222023418 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "escrow_account" ("id" text not null, "order_id" text not null, "amount" integer not null, "currency" text not null, "status" text check ("status" in ('held', 'released', 'refunded', 'disputed')) not null default 'held', "buyer_id" text not null, "seller_id" text not null, "released_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "escrow_account_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_escrow_account_order_id" ON "escrow_account" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_escrow_account_deleted_at" ON "escrow_account" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "escrow_account" cascade;`);
  }

}
