CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"reporting_currency" varchar(10) DEFAULT 'IDR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "financial_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"institution" varchar(100) NOT NULL,
	"account_type" varchar(50) NOT NULL,
	"currency" varchar(10) DEFAULT 'IDR' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instruments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"symbol" varchar(50),
	"asset_type" varchar(50) NOT NULL,
	"market" varchar(50) DEFAULT 'IDX',
	"currency" varchar(10) DEFAULT 'IDR' NOT NULL,
	"unit" varchar(50) DEFAULT 'share' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watchlist_items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"instrument_id" text NOT NULL,
	"note" text,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"instrument_id" text NOT NULL,
	"account_id" text NOT NULL,
	"quantity" numeric(18, 6) DEFAULT '0' NOT NULL,
	"average_cost_per_unit" numeric(18, 4) DEFAULT '0' NOT NULL,
	"total_cost_basis" numeric(18, 2) DEFAULT '0' NOT NULL,
	"current_price" numeric(18, 4) DEFAULT '0' NOT NULL,
	"market_value" numeric(18, 2) DEFAULT '0' NOT NULL,
	"unrealized_pl" numeric(18, 2) DEFAULT '0' NOT NULL,
	"last_valuation_id" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investment_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"instrument_id" text NOT NULL,
	"account_id" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'posted' NOT NULL,
	"trade_date" timestamp with time zone NOT NULL,
	"quantity" numeric(18, 6) NOT NULL,
	"unit_price" numeric(18, 4) NOT NULL,
	"gross_amount" numeric(18, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'IDR' NOT NULL,
	"note" text,
	"import_batch_id" text,
	"reversal_of_id" text,
	"posted_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "realized_profit_loss" (
	"id" text PRIMARY KEY NOT NULL,
	"transaction_id" text NOT NULL,
	"quantity_closed" numeric(18, 6) NOT NULL,
	"average_cost_at_sale" numeric(18, 4) NOT NULL,
	"sale_price" numeric(18, 4) NOT NULL,
	"realized_pl" numeric(18, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'IDR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"instrument_id" text NOT NULL,
	"price" numeric(18, 4) NOT NULL,
	"currency" varchar(10) DEFAULT 'IDR' NOT NULL,
	"unit" varchar(50) DEFAULT 'share' NOT NULL,
	"effective_at" timestamp with time zone NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source_type" varchar(20) DEFAULT 'manual' NOT NULL,
	"source_name" varchar(100) DEFAULT 'User Entry' NOT NULL,
	"status" varchar(20) DEFAULT 'success' NOT NULL,
	"is_manual_override" boolean DEFAULT false NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"financial_account_id" text NOT NULL,
	"opening_balance" numeric(18, 2) DEFAULT '0' NOT NULL,
	"opening_balance_date" timestamp with time zone DEFAULT now() NOT NULL,
	"current_balance" numeric(18, 2) DEFAULT '0' NOT NULL,
	"is_emergency_fund" boolean DEFAULT false NOT NULL,
	"emergency_fund_target" numeric(18, 2),
	"currency" varchar(10) DEFAULT 'IDR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_movements" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"cash_account_id" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'IDR' NOT NULL,
	"movement_date" timestamp with time zone NOT NULL,
	"transfer_group_id" text,
	"related_transaction_id" text,
	"note" text,
	"status" varchar(20) DEFAULT 'posted' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installment_schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"liability_id" text NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"planned_amount" numeric(18, 2) NOT NULL,
	"installment_number" integer NOT NULL,
	"status" varchar(20) DEFAULT 'upcoming' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "liabilities" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"creditor" varchar(100) NOT NULL,
	"original_amount" numeric(18, 2) NOT NULL,
	"outstanding_balance" numeric(18, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'IDR' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"due_date" timestamp with time zone,
	"installment_amount" numeric(18, 2),
	"installment_frequency" varchar(20),
	"installment_count" integer,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "liability_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"liability_id" text NOT NULL,
	"payment_date" timestamp with time zone NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"installment_number" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investment_income" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"instrument_id" text,
	"account_id" text,
	"type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'forecast' NOT NULL,
	"announcement_date" timestamp with time zone,
	"ex_date" timestamp with time zone,
	"payment_date" timestamp with time zone,
	"expected_amount" numeric(18, 2),
	"actual_amount" numeric(18, 2),
	"currency" varchar(10) DEFAULT 'IDR' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fx_rates" (
	"id" text PRIMARY KEY NOT NULL,
	"base_currency" varchar(10) NOT NULL,
	"quote_currency" varchar(10) NOT NULL,
	"rate" numeric(18, 6) NOT NULL,
	"effective_at" timestamp with time zone NOT NULL,
	"source" varchar(100) NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"snapshot_date" timestamp with time zone NOT NULL,
	"reporting_currency" varchar(10) DEFAULT 'IDR' NOT NULL,
	"total_investments" numeric(18, 2) NOT NULL,
	"total_cash" numeric(18, 2) NOT NULL,
	"total_liabilities" numeric(18, 2) NOT NULL,
	"net_worth" numeric(18, 2) NOT NULL,
	"breakdown" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" text NOT NULL,
	"action" varchar(50) NOT NULL,
	"before_data" jsonb,
	"after_data" jsonb,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_batches" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_hash" varchar(64) NOT NULL,
	"data_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'completed' NOT NULL,
	"row_count" integer DEFAULT 0 NOT NULL,
	"success_count" integer DEFAULT 0 NOT NULL,
	"error_count" integer DEFAULT 0 NOT NULL,
	"skipped_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instruments" ADD CONSTRAINT "instruments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_account_id_financial_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."financial_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_transactions" ADD CONSTRAINT "investment_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_transactions" ADD CONSTRAINT "investment_transactions_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_transactions" ADD CONSTRAINT "investment_transactions_account_id_financial_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."financial_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "realized_profit_loss" ADD CONSTRAINT "realized_profit_loss_transaction_id_investment_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."investment_transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuations" ADD CONSTRAINT "valuations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuations" ADD CONSTRAINT "valuations_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_financial_account_id_financial_accounts_id_fk" FOREIGN KEY ("financial_account_id") REFERENCES "public"."financial_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_cash_account_id_cash_accounts_id_fk" FOREIGN KEY ("cash_account_id") REFERENCES "public"."cash_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_schedules" ADD CONSTRAINT "installment_schedules_liability_id_liabilities_id_fk" FOREIGN KEY ("liability_id") REFERENCES "public"."liabilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liabilities" ADD CONSTRAINT "liabilities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liability_payments" ADD CONSTRAINT "liability_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liability_payments" ADD CONSTRAINT "liability_payments_liability_id_liabilities_id_fk" FOREIGN KEY ("liability_id") REFERENCES "public"."liabilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_income" ADD CONSTRAINT "investment_income_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_income" ADD CONSTRAINT "investment_income_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_income" ADD CONSTRAINT "investment_income_account_id_financial_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."financial_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pos_user_inst_acc_idx" ON "positions" USING btree ("user_id","instrument_id","account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "snap_user_date_idx" ON "snapshots" USING btree ("user_id","snapshot_date","reporting_currency");