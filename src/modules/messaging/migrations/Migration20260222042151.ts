import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260222042151 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`drop table if exists "job_contract" cascade;`);
    this.addSql(`drop table if exists "message" cascade;`);
    this.addSql(`create table if not exists "job_contract" ("id" text not null, "order_id" text not null, "client_id" text not null, "actor_id" text not null, "status" text check ("status" in ('pending', 'in_progress', 'completed', 'disputed')) not null default 'pending', "amount" integer not null, "currency_code" text not null, "escrow_details" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "job_contract_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_job_contract_order_id_unique" ON "job_contract" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_job_contract_order_id" ON "job_contract" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_job_contract_deleted_at" ON "job_contract" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "message" ("id" text not null, "order_id" text not null, "from_id" text not null, "to_id" text not null, "text" text null, "attachments" jsonb null, "is_read" boolean not null default false, "timestamp" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "message_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_message_order_id" ON "message" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_message_deleted_at" ON "message" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "job_contract" cascade;`);

    this.addSql(`drop table if exists "message" cascade;`);
  }

}
