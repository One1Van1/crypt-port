--
-- PostgreSQL database dump
--

-- Dumped from database version 15.10
-- Dumped by pg_dump version 15.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: bank_account_withdrawn_operations_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.bank_account_withdrawn_operations_type_enum AS ENUM (
    'CREDIT',
    'DEBIT'
);


ALTER TYPE public.bank_account_withdrawn_operations_type_enum OWNER TO postgres;

--
-- Name: bank_accounts_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.bank_accounts_status_enum AS ENUM (
    'working',
    'not_working',
    'blocked'
);


ALTER TYPE public.bank_accounts_status_enum OWNER TO postgres;

--
-- Name: banks_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.banks_status_enum AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.banks_status_enum OWNER TO postgres;

--
-- Name: cash_withdrawal_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.cash_withdrawal_status_enum AS ENUM (
    'pending',
    'awaiting_confirmation',
    'converted'
);


ALTER TYPE public.cash_withdrawal_status_enum OWNER TO postgres;

--
-- Name: drop_neo_banks_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.drop_neo_banks_status_enum AS ENUM (
    'active',
    'frozen'
);


ALTER TYPE public.drop_neo_banks_status_enum OWNER TO postgres;

--
-- Name: drops_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.drops_status_enum AS ENUM (
    'active',
    'frozen'
);


ALTER TYPE public.drops_status_enum OWNER TO postgres;

--
-- Name: free_usdt_adjustments_reason_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.free_usdt_adjustments_reason_enum AS ENUM (
    'RESERVE_PROFIT'
);


ALTER TYPE public.free_usdt_adjustments_reason_enum OWNER TO postgres;

--
-- Name: platforms_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.platforms_status_enum AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.platforms_status_enum OWNER TO postgres;

--
-- Name: shifts_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.shifts_status_enum AS ENUM (
    'active',
    'completed'
);


ALTER TYPE public.shifts_status_enum OWNER TO postgres;

--
-- Name: transactions_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transactions_status_enum AS ENUM (
    'pending',
    'completed',
    'failed'
);


ALTER TYPE public.transactions_status_enum OWNER TO postgres;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'admin',
    'teamlead',
    'operator',
    'pending'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

--
-- Name: users_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_status_enum AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.users_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: balances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.balances (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    amount numeric(15,2) NOT NULL,
    amount_usdt numeric(15,4),
    exchange_rate numeric(10,4) NOT NULL,
    description character varying,
    platform_id integer
);


ALTER TABLE public.balances OWNER TO postgres;

--
-- Name: balances_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.balances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.balances_id_seq OWNER TO postgres;

--
-- Name: balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.balances_id_seq OWNED BY public.balances.id;


--
-- Name: bank_account_withdrawn_operations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_account_withdrawn_operations (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    bank_account_id integer NOT NULL,
    type public.bank_account_withdrawn_operations_type_enum NOT NULL,
    amount_pesos numeric(15,2) NOT NULL,
    remaining_pesos numeric(15,2) DEFAULT 0 NOT NULL,
    platform_rate numeric(10,2),
    platform_id integer,
    source_drop_neo_bank_id integer,
    transaction_id integer,
    cash_withdrawal_id integer,
    created_by_user_id integer
);


ALTER TABLE public.bank_account_withdrawn_operations OWNER TO postgres;

--
-- Name: bank_account_withdrawn_operations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_account_withdrawn_operations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.bank_account_withdrawn_operations_id_seq OWNER TO postgres;

--
-- Name: bank_account_withdrawn_operations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_account_withdrawn_operations_id_seq OWNED BY public.bank_account_withdrawn_operations.id;


--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_accounts (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    cbu character varying(22) NOT NULL,
    alias character varying NOT NULL,
    status public.bank_accounts_status_enum DEFAULT 'working'::public.bank_accounts_status_enum NOT NULL,
    block_reason character varying,
    current_limit_amount numeric(15,2) NOT NULL,
    withdrawn_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    priority integer DEFAULT 1 NOT NULL,
    last_used_at timestamp without time zone,
    bank_id integer NOT NULL,
    drop_id integer NOT NULL,
    initial_limit_amount numeric(15,2) NOT NULL
);


ALTER TABLE public.bank_accounts OWNER TO postgres;

--
-- Name: bank_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.bank_accounts_id_seq OWNER TO postgres;

--
-- Name: bank_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_accounts_id_seq OWNED BY public.bank_accounts.id;


--
-- Name: banks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banks (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    name character varying NOT NULL,
    code character varying,
    status public.banks_status_enum DEFAULT 'active'::public.banks_status_enum NOT NULL
);


ALTER TABLE public.banks OWNER TO postgres;

--
-- Name: banks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.banks_id_seq OWNER TO postgres;

--
-- Name: banks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banks_id_seq OWNED BY public.banks.id;


--
-- Name: cash_withdrawals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cash_withdrawals (
    id integer NOT NULL,
    amount_pesos numeric(15,2) NOT NULL,
    bank_account_id integer NOT NULL,
    status public.cash_withdrawal_status_enum DEFAULT 'pending'::public.cash_withdrawal_status_enum NOT NULL,
    withdrawn_by_user_id integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    withdrawal_rate numeric(15,2) NOT NULL
);


ALTER TABLE public.cash_withdrawals OWNER TO postgres;

--
-- Name: cash_withdrawals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cash_withdrawals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cash_withdrawals_id_seq OWNER TO postgres;

--
-- Name: cash_withdrawals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cash_withdrawals_id_seq OWNED BY public.cash_withdrawals.id;


--
-- Name: daily_profits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_profits (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    date date NOT NULL,
    total_usdt numeric(18,8) NOT NULL,
    initial_deposit numeric(18,8) NOT NULL,
    profit numeric(18,8) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.daily_profits OWNER TO postgres;

--
-- Name: deficit_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deficit_records (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    date date NOT NULL,
    amount_usdt numeric(18,8) NOT NULL,
    working_deposit_usdt numeric(18,8) NOT NULL,
    initial_deposit_usdt numeric(18,8) NOT NULL,
    created_by_user_id integer
);


ALTER TABLE public.deficit_records OWNER TO postgres;

--
-- Name: deficit_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.deficit_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.deficit_records_id_seq OWNER TO postgres;

--
-- Name: deficit_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deficit_records_id_seq OWNED BY public.deficit_records.id;


--
-- Name: drop_neo_bank_freeze_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drop_neo_bank_freeze_events (
    id integer NOT NULL,
    neo_bank_id integer NOT NULL,
    performed_by_user_id integer NOT NULL,
    action character varying NOT NULL,
    frozen_amount numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);


ALTER TABLE public.drop_neo_bank_freeze_events OWNER TO postgres;

--
-- Name: drop_neo_bank_freeze_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drop_neo_bank_freeze_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.drop_neo_bank_freeze_events_id_seq OWNER TO postgres;

--
-- Name: drop_neo_bank_freeze_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drop_neo_bank_freeze_events_id_seq OWNED BY public.drop_neo_bank_freeze_events.id;


--
-- Name: drop_neo_banks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drop_neo_banks (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    provider character varying NOT NULL,
    account_id character varying NOT NULL,
    alias character varying,
    status public.drop_neo_banks_status_enum DEFAULT 'active'::public.drop_neo_banks_status_enum NOT NULL,
    drop_id integer NOT NULL,
    current_balance numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    platform_id integer,
    exchange_rate numeric(10,2),
    usdt_equivalent numeric(15,4),
    daily_limit numeric(12,2),
    monthly_limit numeric(12,2),
    frozen_amount numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.drop_neo_banks OWNER TO postgres;

--
-- Name: drop_neo_banks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drop_neo_banks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.drop_neo_banks_id_seq OWNER TO postgres;

--
-- Name: drop_neo_banks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drop_neo_banks_id_seq OWNED BY public.drop_neo_banks.id;


--
-- Name: drops; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drops (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    name character varying NOT NULL,
    comment character varying,
    status public.drops_status_enum DEFAULT 'active'::public.drops_status_enum NOT NULL
);


ALTER TABLE public.drops OWNER TO postgres;

--
-- Name: drops_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drops_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.drops_id_seq OWNER TO postgres;

--
-- Name: drops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drops_id_seq OWNED BY public.drops.id;


--
-- Name: exchange_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exchange_rates (
    id integer NOT NULL,
    rate numeric(15,2) NOT NULL,
    set_by_user_id integer NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.exchange_rates OWNER TO postgres;

--
-- Name: exchange_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exchange_rates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exchange_rates_id_seq OWNER TO postgres;

--
-- Name: exchange_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exchange_rates_id_seq OWNED BY public.exchange_rates.id;


--
-- Name: free_usdt_adjustments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.free_usdt_adjustments (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    reason public.free_usdt_adjustments_reason_enum NOT NULL,
    amount_usdt numeric(18,8) NOT NULL,
    profit_reserve_id integer,
    created_by_user_id integer
);


ALTER TABLE public.free_usdt_adjustments OWNER TO postgres;

--
-- Name: free_usdt_adjustments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.free_usdt_adjustments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.free_usdt_adjustments_id_seq OWNER TO postgres;

--
-- Name: free_usdt_adjustments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.free_usdt_adjustments_id_seq OWNED BY public.free_usdt_adjustments.id;


--
-- Name: free_usdt_distributions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.free_usdt_distributions (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    platform_id integer NOT NULL,
    amount_usdt numeric(15,2) NOT NULL,
    distributed_by_user_id integer NOT NULL,
    comment text
);


ALTER TABLE public.free_usdt_distributions OWNER TO postgres;

--
-- Name: free_usdt_distributions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.free_usdt_distributions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.free_usdt_distributions_id_seq OWNER TO postgres;

--
-- Name: free_usdt_distributions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.free_usdt_distributions_id_seq OWNED BY public.free_usdt_distributions.id;


--
-- Name: free_usdt_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.free_usdt_entries (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    conversion_id integer NOT NULL,
    pesos_amount numeric(15,2) NOT NULL,
    exchange_rate numeric(15,2) NOT NULL,
    usdt_amount numeric(15,2) NOT NULL,
    converted_by_user_id integer NOT NULL,
    confirmed_by_user_id integer NOT NULL,
    confirmed_at timestamp without time zone NOT NULL
);


ALTER TABLE public.free_usdt_entries OWNER TO postgres;

--
-- Name: free_usdt_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.free_usdt_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.free_usdt_entries_id_seq OWNER TO postgres;

--
-- Name: free_usdt_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.free_usdt_entries_id_seq OWNED BY public.free_usdt_entries.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: neo_bank_withdrawals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.neo_bank_withdrawals (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    amount numeric(15,2) NOT NULL,
    neo_bank_id integer NOT NULL,
    bank_account_id integer NOT NULL,
    transaction_id integer NOT NULL,
    withdrawn_by_user_id integer NOT NULL,
    balance_before numeric(15,2) NOT NULL,
    balance_after numeric(15,2) NOT NULL,
    comment text
);


ALTER TABLE public.neo_bank_withdrawals OWNER TO postgres;

--
-- Name: neo_bank_withdrawals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.neo_bank_withdrawals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.neo_bank_withdrawals_id_seq OWNER TO postgres;

--
-- Name: neo_bank_withdrawals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.neo_bank_withdrawals_id_seq OWNED BY public.neo_bank_withdrawals.id;


--
-- Name: peso_to_usdt_conversions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.peso_to_usdt_conversions (
    id integer NOT NULL,
    pesos_amount numeric(15,2) NOT NULL,
    exchange_rate numeric(15,2) NOT NULL,
    usdt_amount numeric(15,2) NOT NULL,
    converted_by_user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    cash_withdrawal_id integer,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    comment text
);


ALTER TABLE public.peso_to_usdt_conversions OWNER TO postgres;

--
-- Name: peso_to_usdt_conversions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.peso_to_usdt_conversions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.peso_to_usdt_conversions_id_seq OWNER TO postgres;

--
-- Name: peso_to_usdt_conversions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.peso_to_usdt_conversions_id_seq OWNED BY public.peso_to_usdt_conversions.id;


--
-- Name: platforms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platforms (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    name character varying NOT NULL,
    status public.platforms_status_enum DEFAULT 'active'::public.platforms_status_enum NOT NULL,
    exchange_rate numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    balance numeric(15,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.platforms OWNER TO postgres;

--
-- Name: platforms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.platforms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.platforms_id_seq OWNER TO postgres;

--
-- Name: platforms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.platforms_id_seq OWNED BY public.platforms.id;


--
-- Name: profit_reserves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profit_reserves (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    date date NOT NULL,
    amount_usdt numeric(18,8) NOT NULL,
    working_deposit_usdt numeric(18,8) NOT NULL,
    initial_deposit_usdt numeric(18,8) NOT NULL,
    created_by_user_id integer
);


ALTER TABLE public.profit_reserves OWNER TO postgres;

--
-- Name: profit_reserves_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profit_reserves_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.profit_reserves_id_seq OWNER TO postgres;

--
-- Name: profit_reserves_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profit_reserves_id_seq OWNED BY public.profit_reserves.id;


--
-- Name: profits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profits (
    id integer NOT NULL,
    withdrawn_usdt numeric(15,2) NOT NULL,
    admin_rate numeric(15,2) NOT NULL,
    profit_pesos numeric(15,2) NOT NULL,
    returned_to_section character varying NOT NULL,
    returned_amount_pesos numeric(15,2) NOT NULL,
    created_by_user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.profits OWNER TO postgres;

--
-- Name: profits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.profits_id_seq OWNER TO postgres;

--
-- Name: profits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profits_id_seq OWNED BY public.profits.id;


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shifts (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone,
    duration integer,
    total_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    operations_count integer DEFAULT 0 NOT NULL,
    status public.shifts_status_enum DEFAULT 'active'::public.shifts_status_enum NOT NULL,
    user_id integer NOT NULL,
    platform_id integer NOT NULL
);


ALTER TABLE public.shifts OWNER TO postgres;

--
-- Name: shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shifts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.shifts_id_seq OWNER TO postgres;

--
-- Name: shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shifts_id_seq OWNED BY public.shifts.id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    key character varying NOT NULL,
    value text NOT NULL,
    description character varying
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.system_settings_id_seq OWNER TO postgres;

--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    amount numeric(15,2) NOT NULL,
    amount_usdt numeric(15,4),
    status public.transactions_status_enum DEFAULT 'pending'::public.transactions_status_enum NOT NULL,
    comment character varying,
    bank_account_id integer NOT NULL,
    shift_id integer NOT NULL,
    user_id integer NOT NULL,
    receipt character varying,
    source_drop_neo_bank_id integer,
    exchange_rate numeric(10,2),
    platform_id integer
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: usdt_to_peso_exchanges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usdt_to_peso_exchanges (
    id integer NOT NULL,
    platform_id integer NOT NULL,
    neo_bank_id integer NOT NULL,
    usdt_amount numeric(15,2) NOT NULL,
    exchange_rate numeric(15,2) NOT NULL,
    pesos_amount numeric(15,2) NOT NULL,
    created_by_user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.usdt_to_peso_exchanges OWNER TO postgres;

--
-- Name: usdt_to_peso_exchanges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usdt_to_peso_exchanges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usdt_to_peso_exchanges_id_seq OWNER TO postgres;

--
-- Name: usdt_to_peso_exchanges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usdt_to_peso_exchanges_id_seq OWNED BY public.usdt_to_peso_exchanges.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    username character varying,
    email character varying NOT NULL,
    password character varying NOT NULL,
    role public.users_role_enum DEFAULT 'pending'::public.users_role_enum NOT NULL,
    status public.users_status_enum DEFAULT 'active'::public.users_status_enum NOT NULL,
    two_factor_secret character varying,
    two_factor_enabled boolean DEFAULT false NOT NULL,
    phone character varying,
    telegram character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: balances id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balances ALTER COLUMN id SET DEFAULT nextval('public.balances_id_seq'::regclass);


--
-- Name: bank_account_withdrawn_operations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_account_withdrawn_operations ALTER COLUMN id SET DEFAULT nextval('public.bank_account_withdrawn_operations_id_seq'::regclass);


--
-- Name: bank_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts ALTER COLUMN id SET DEFAULT nextval('public.bank_accounts_id_seq'::regclass);


--
-- Name: banks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks ALTER COLUMN id SET DEFAULT nextval('public.banks_id_seq'::regclass);


--
-- Name: cash_withdrawals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_withdrawals ALTER COLUMN id SET DEFAULT nextval('public.cash_withdrawals_id_seq'::regclass);


--
-- Name: deficit_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deficit_records ALTER COLUMN id SET DEFAULT nextval('public.deficit_records_id_seq'::regclass);


--
-- Name: drop_neo_bank_freeze_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drop_neo_bank_freeze_events ALTER COLUMN id SET DEFAULT nextval('public.drop_neo_bank_freeze_events_id_seq'::regclass);


--
-- Name: drop_neo_banks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drop_neo_banks ALTER COLUMN id SET DEFAULT nextval('public.drop_neo_banks_id_seq'::regclass);


--
-- Name: drops id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drops ALTER COLUMN id SET DEFAULT nextval('public.drops_id_seq'::regclass);


--
-- Name: exchange_rates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exchange_rates ALTER COLUMN id SET DEFAULT nextval('public.exchange_rates_id_seq'::regclass);


--
-- Name: free_usdt_adjustments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.free_usdt_adjustments ALTER COLUMN id SET DEFAULT nextval('public.free_usdt_adjustments_id_seq'::regclass);


--
-- Name: free_usdt_distributions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.free_usdt_distributions ALTER COLUMN id SET DEFAULT nextval('public.free_usdt_distributions_id_seq'::regclass);


--
-- Name: free_usdt_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.free_usdt_entries ALTER COLUMN id SET DEFAULT nextval('public.free_usdt_entries_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: neo_bank_withdrawals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neo_bank_withdrawals ALTER COLUMN id SET DEFAULT nextval('public.neo_bank_withdrawals_id_seq'::regclass);


--
-- Name: peso_to_usdt_conversions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peso_to_usdt_conversions ALTER COLUMN id SET DEFAULT nextval('public.peso_to_usdt_conversions_id_seq'::regclass);


--
-- Name: platforms id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platforms ALTER COLUMN id SET DEFAULT nextval('public.platforms_id_seq'::regclass);


--
-- Name: profit_reserves id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profit_reserves ALTER COLUMN id SET DEFAULT nextval('public.profit_reserves_id_seq'::regclass);


--
-- Name: profits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profits ALTER COLUMN id SET DEFAULT nextval('public.profits_id_seq'::regclass);


--
-- Name: shifts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts ALTER COLUMN id SET DEFAULT nextval('public.shifts_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: usdt_to_peso_exchanges id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usdt_to_peso_exchanges ALTER COLUMN id SET DEFAULT nextval('public.usdt_to_peso_exchanges_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: balances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.balances (id, created_at, updated_at, deleted_at, amount, amount_usdt, exchange_rate, description, platform_id) FROM stdin;
\.


--
-- Data for Name: bank_account_withdrawn_operations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_account_withdrawn_operations (id, created_at, updated_at, deleted_at, bank_account_id, type, amount_pesos, remaining_pesos, platform_rate, platform_id, source_drop_neo_bank_id, transaction_id, cash_withdrawal_id, created_by_user_id) FROM stdin;
30	2026-01-05 00:30:01.727375	2026-01-05 00:30:01.727375	\N	8	CREDIT	100000.00	0.00	1100.00	1	1	6	\N	15
31	2026-01-05 00:30:23.804097	2026-01-05 00:30:23.804097	\N	8	CREDIT	100000.00	0.00	1100.00	1	1	7	\N	15
32	2026-01-05 20:49:29.243617	2026-01-05 20:49:29.243617	\N	8	CREDIT	200000.00	0.00	1100.00	1	1	8	\N	12
33	2026-01-06 21:19:32.292116	2026-01-06 21:19:32.292116	\N	8	CREDIT	100000.00	0.00	1202.27	2	3	9	\N	12
34	2026-01-08 18:48:49.722743	2026-01-08 18:48:49.722743	\N	8	CREDIT	100000.00	100000.00	1202.27	2	3	10	\N	17
35	2026-01-08 18:52:11.865201	2026-01-08 18:52:11.865201	\N	8	CREDIT	100000.00	100000.00	1202.27	2	3	11	\N	16
36	2026-01-08 22:57:47.432755	2026-01-08 22:57:47.432755	\N	10	CREDIT	10.00	0.00	1202.27	2	3	12	\N	12
37	2026-01-08 23:08:44.243495	2026-01-08 23:08:44.243495	\N	10	CREDIT	10.00	0.00	1202.27	2	3	13	\N	12
38	2026-01-08 23:11:33.897343	2026-01-08 23:11:33.897343	\N	10	CREDIT	10.00	0.00	1202.27	2	3	14	\N	12
39	2026-01-08 23:22:39.778922	2026-01-08 23:22:39.778922	\N	10	CREDIT	10.00	0.00	1202.27	2	3	15	\N	12
40	2026-01-08 23:35:52.177084	2026-01-08 23:35:52.177084	\N	10	CREDIT	10.00	0.00	1202.27	2	3	16	\N	12
43	2026-01-09 04:14:38.195351	2026-01-09 04:14:38.195351	\N	7	CREDIT	410000.00	410000.00	1150.00	2	6	19	\N	12
44	2026-01-09 04:40:05.777686	2026-01-09 04:40:05.777686	\N	7	CREDIT	12.00	12.00	1150.00	2	3	20	\N	12
50	2026-01-09 16:30:30.299505	2026-01-09 16:30:30.299505	\N	7	DEBIT	110112.00	0.00	1150.00	2	\N	\N	8	12
25	2026-01-09 16:21:13.597743	2026-01-09 16:30:30.299505	\N	7	CREDIT	100.00	0.00	1150.00	2	3	21	\N	12
41	2026-01-09 03:32:05.546626	2026-01-09 16:30:30.299505	\N	7	CREDIT	100000.00	0.00	1150.00	2	6	17	\N	12
45	2026-01-05 01:49:45.328168	2026-01-05 01:49:45.328168	\N	8	DEBIT	100000.00	0.00	1100.00	1	\N	\N	3	15
46	2026-01-05 23:09:18.87005	2026-01-05 23:09:18.87005	\N	2	DEBIT	100000.00	0.00	1150.00	2	\N	\N	5	12
47	2026-01-05 23:04:26.102549	2026-01-05 23:04:26.102549	\N	8	DEBIT	200000.00	0.00	1150.00	2	\N	\N	4	12
48	2026-01-08 18:50:56.814581	2026-01-08 18:50:56.814581	\N	8	DEBIT	100000.00	0.00	1150.00	2	\N	\N	6	17
49	2026-01-09 00:11:51.759996	2026-01-09 00:11:51.759996	\N	10	DEBIT	50.00	0.00	1150.00	2	\N	\N	7	12
26	2026-01-04 19:38:19.620863	2026-01-04 19:38:19.620863	\N	2	CREDIT	50000.00	0.00	1150.00	2	3	2	\N	14
27	2026-01-04 23:23:10.328308	2026-01-04 23:23:10.328308	\N	2	CREDIT	100000.00	50000.00	1202.27	2	3	3	\N	14
28	2026-01-04 23:55:36.355157	2026-01-04 23:55:36.355157	\N	2	CREDIT	150000.00	150000.00	1150.00	2	4	4	\N	14
29	2026-01-04 23:58:31.469673	2026-01-04 23:58:31.469673	\N	2	CREDIT	100000.00	100000.00	1100.00	1	1	5	\N	15
42	2026-01-09 03:37:46.376991	2026-01-09 16:30:30.299505	\N	7	CREDIT	100000.00	89988.00	1150.00	2	6	18	\N	12
\.


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_accounts (id, created_at, updated_at, deleted_at, cbu, alias, status, block_reason, current_limit_amount, withdrawn_amount, priority, last_used_at, bank_id, drop_id, initial_limit_amount) FROM stdin;
1	2026-01-04 18:49:39.417194	2026-01-09 00:14:25.24503	2026-01-09 00:13:45.241444	000000310000000000011	DROP1.GALICIA.1	working	\N	5000000.00	0.00	8	\N	1	1	5000000.00
4	2026-01-04 18:49:39.417194	2026-01-09 00:51:26.415885	2026-01-09 00:51:26.415885	000000310000000000041	DROP1.SANTANDER.1	working	\N	5000000.00	0.00	6	\N	4	3	5000000.00
9	2026-01-08 22:32:12.275304	2026-01-08 23:27:08.860727	\N	1234567890123456789011	123123	working	\N	100000.00	0.00	4	\N	1	3	100000.00
5	2026-01-04 18:49:39.418743	2026-01-08 23:27:08.860727	\N	000000310000000000012	DROP1.GALICIA.2	working	\N	5000000.00	0.00	5	\N	1	2	5000000.00
2	2026-01-04 18:49:39.417194	2026-01-09 00:14:25.24503	\N	000000310000000000021	DROP1.NACION.1	working	\N	4550000.00	300000.00	6	2026-01-04 20:58:31.48	2	1	4950000.00
3	2026-01-04 18:49:39.417194	2026-01-09 00:14:25.24503	\N	000000310000000000031	DROP1.BBVA.1	working	\N	5000000.00	0.00	7	\N	3	3	5000000.00
8	2026-01-04 18:49:39.418743	2026-01-09 00:14:25.24503	\N	000000310000000000042	DROP1.SANTANDER.2	blocked	\N	0.00	200000.00	8	2026-01-08 15:52:11.878	4	1	200000.00
10	2026-01-08 22:47:01.632635	2026-01-09 00:14:25.24503	\N	1234567890123456789012	123123	blocked	Достигнут лимит вывода	0.00	0.00	9	2026-01-08 20:35:52.191	3	2	50.00
6	2026-01-04 18:49:39.418743	2026-01-09 14:00:10.19087	\N	000000310000000000022	DROP1.NACION.2	working	\N	5000000.00	0.00	2	\N	2	3	5000000.00
11	2026-01-08 22:47:39.62228	2026-01-09 14:00:12.083764	\N	1234567890123456789013	123123	working	\N	10.00	0.00	3	\N	3	1	10.00
7	2026-01-04 18:49:39.418743	2026-01-09 16:30:30.299505	\N	000000310000000000032	DROP1.BBVA.2	working	\N	4389888.00	500000.00	1	2026-01-09 13:21:13.62	3	3	5000000.00
\.


--
-- Data for Name: banks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banks (id, created_at, updated_at, deleted_at, name, code, status) FROM stdin;
1	2026-01-04 18:49:39.409894	2026-01-04 18:49:39.409894	\N	Banco Galicia	GALICIA	active
2	2026-01-04 18:49:39.409894	2026-01-04 18:49:39.409894	\N	Banco Nación	NACION	active
3	2026-01-04 18:49:39.409894	2026-01-04 18:49:39.409894	\N	BBVA	BBVA	active
4	2026-01-04 18:49:39.409894	2026-01-04 18:49:39.409894	\N	Santander	SANTANDER	active
6	2026-01-09 01:18:51.290039	2026-01-09 01:18:51.290039	\N	тест	123123123	active
5	2026-01-09 01:11:54.558336	2026-01-09 01:20:32.612998	2026-01-09 01:20:32.612998	Тест	123123123	active
\.


--
-- Data for Name: cash_withdrawals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cash_withdrawals (id, amount_pesos, bank_account_id, status, withdrawn_by_user_id, comment, created_at, updated_at, deleted_at, withdrawal_rate) FROM stdin;
3	100000.00	8	converted	15	\N	2026-01-05 01:49:45.328168	2026-01-05 02:57:15.890922	\N	1100.00
5	100000.00	2	converted	12	\N	2026-01-05 23:09:18.87005	2026-01-06 21:25:04.812917	\N	1150.00
4	200000.00	8	converted	12	\N	2026-01-05 23:04:26.102549	2026-01-06 21:25:04.817768	\N	1150.00
6	100000.00	8	converted	17	\N	2026-01-08 18:50:56.814581	2026-01-09 16:28:41.536406	\N	1150.00
7	50.00	10	converted	12	\N	2026-01-09 00:11:51.759996	2026-01-09 16:30:00.280586	\N	1150.00
8	110112.00	7	converted	12	\N	2026-01-09 16:30:30.299505	2026-01-09 16:30:46.157478	\N	1150.00
\.


--
-- Data for Name: daily_profits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_profits (id, date, total_usdt, initial_deposit, profit, created_at, updated_at, deleted_at) FROM stdin;
7f970462-0d92-4433-be19-39cad202178a	2026-01-05	8450.54000000	9500.00000000	-1049.46000000	2026-01-05 18:27:11.485938	2026-01-05 18:27:11.485938	\N
7db86143-a174-48c0-a298-79fb064e86d9	2026-01-04	8200.00000000	9500.00000000	-1300.00000000	2026-01-05 18:27:11.485938	2026-01-05 18:27:11.485938	\N
50d4e532-e342-4ce4-84c5-6b707e73c244	2026-01-03	8100.00000000	9500.00000000	-1400.00000000	2026-01-05 18:27:11.485938	2026-01-05 18:27:11.485938	\N
04cc9f5f-b46a-4549-a876-7fb38682a234	2026-01-02	7900.00000000	9500.00000000	-1600.00000000	2026-01-05 18:27:11.485938	2026-01-05 18:27:11.485938	\N
\.


--
-- Data for Name: deficit_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deficit_records (id, created_at, updated_at, deleted_at, date, amount_usdt, working_deposit_usdt, initial_deposit_usdt, created_by_user_id) FROM stdin;
4	2026-01-06 21:21:57.071114	2026-01-06 21:27:22.143155	\N	2026-01-06	126.86810000	9373.13190000	9500.00000000	12
\.


--
-- Data for Name: drop_neo_bank_freeze_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drop_neo_bank_freeze_events (id, neo_bank_id, performed_by_user_id, action, frozen_amount, created_at, updated_at, deleted_at) FROM stdin;
1	6	12	freeze	100000.00	2026-01-09 14:37:20.148789	2026-01-09 14:37:20.148789	\N
2	3	12	freeze	10000.00	2026-01-09 14:38:00.640556	2026-01-09 14:38:00.640556	\N
3	3	12	unfreeze	0.00	2026-01-09 14:38:29.35605	2026-01-09 14:38:29.35605	\N
4	6	12	unfreeze	0.00	2026-01-09 14:38:55.339016	2026-01-09 14:38:55.339016	\N
5	2	12	unfreeze	0.00	2026-01-09 14:41:16.649458	2026-01-09 14:41:16.649458	\N
6	6	12	freeze	10000.00	2026-01-09 14:41:29.235516	2026-01-09 14:41:29.235516	\N
\.


--
-- Data for Name: drop_neo_banks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drop_neo_banks (id, created_at, updated_at, deleted_at, provider, account_id, alias, status, drop_id, current_balance, platform_id, exchange_rate, usdt_equivalent, daily_limit, monthly_limit, frozen_amount) FROM stdin;
1	2026-01-04 18:49:39.414627	2026-01-06 16:42:09.437501	\N	ripio	1122334455667788	BINANCE.RIPIO.1	active	2	0.00	1	1100.00	590.9045	500000.00	5000000.00	0.00
4	2026-01-04 18:49:39.414627	2026-01-09 02:03:52.150892	\N	yont	4455667788990011	BYBIT.YONT.1	active	2	0.00	2	1150.00	869.5652	500000.00	5000000.00	0.00
3	2026-01-04 18:49:39.414627	2026-01-09 14:38:29.353107	\N	satoshi_tango	3344556677889900	BYBIT.SATOSHI.1	active	3	0.00	2	1202.27	582.1891	500000.00	5000000.00	0.00
2	2026-01-04 18:49:39.414627	2026-01-09 14:41:16.642551	\N	lemon_cash	2233445566778899	BINANCE.LEMON.1	active	1	0.00	1	1100.00	500.0000	500000.00	5000000.00	0.00
6	2026-01-06 21:04:33.958955	2026-01-09 14:41:29.223811	\N	kakak	1234567890123456789011	хуйхуй	frozen	3	0.00	2	\N	\N	600000.00	5000000.00	10000.00
7	2026-01-09 14:45:52.714868	2026-01-09 14:50:30.561894	2026-01-09 14:50:30.561894	riri	12345678901234567890321		active	1	0.00	6	\N	\N	10.00	100.00	0.00
9	2026-01-09 14:59:56.350484	2026-01-09 15:00:09.307173	2026-01-09 15:00:09.307173	щтщгтщщщтщтщт	6516516516516516516516	156165	active	2	0.00	6	\N	\N	200320.00	351651.00	0.00
8	2026-01-09 14:54:47.514592	2026-01-09 15:00:14.634296	2026-01-09 15:00:14.634296	нгнгп	123	12	active	2	0.00	6	\N	\N	111.00	1111.00	0.00
\.


--
-- Data for Name: drops; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drops (id, created_at, updated_at, deleted_at, name, comment, status) FROM stdin;
1	2026-01-04 18:49:39.413608	2026-01-04 18:49:39.413608	\N	Drop 1	Main drop for bank accounts	active
2	2026-01-04 20:41:58.422451	2026-01-04 20:41:58.422451	\N	Drop 2		active
3	2026-01-04 20:41:58.422451	2026-01-04 20:41:58.422451	\N	Drop 3		active
\.


--
-- Data for Name: exchange_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exchange_rates (id, rate, set_by_user_id, is_active, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: free_usdt_adjustments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.free_usdt_adjustments (id, created_at, updated_at, deleted_at, reason, amount_usdt, profit_reserve_id, created_by_user_id) FROM stdin;
1	2026-01-06 19:47:49.223874	2026-01-06 19:47:49.223874	\N	RESERVE_PROFIT	-86.35726522	\N	12
2	2026-01-06 19:51:56.010181	2026-01-06 19:51:56.010181	\N	RESERVE_PROFIT	86.35726522	\N	12
3	2026-01-06 19:52:13.132925	2026-01-06 19:52:13.132925	\N	RESERVE_PROFIT	-86.35726522	\N	12
4	2026-01-06 19:52:15.911701	2026-01-06 19:52:15.911701	\N	RESERVE_PROFIT	86.35726522	\N	12
5	2026-01-06 19:52:25.689666	2026-01-06 19:52:25.689666	\N	RESERVE_PROFIT	-86.35726522	\N	12
6	2026-01-06 19:52:33.460489	2026-01-06 19:52:33.460489	\N	RESERVE_PROFIT	86.35726522	\N	12
7	2026-01-06 20:04:29.741639	2026-01-06 20:04:29.741639	\N	RESERVE_PROFIT	-86.35726522	\N	12
8	2026-01-06 20:12:48.890866	2026-01-06 20:12:48.890866	\N	RESERVE_PROFIT	0.00000000	\N	12
9	2026-01-06 20:12:57.880286	2026-01-06 20:12:57.880286	\N	RESERVE_PROFIT	86.00000000	\N	12
10	2026-01-06 21:21:57.071114	2026-01-06 21:21:57.071114	\N	RESERVE_PROFIT	0.35726522	\N	12
11	2026-01-09 16:48:00.349101	2026-01-09 16:48:00.349101	\N	RESERVE_PROFIT	-94.43646242	\N	12
12	2026-01-09 16:56:39.01033	2026-01-09 16:56:39.01033	\N	RESERVE_PROFIT	0.00000000	\N	12
13	2026-01-09 16:57:46.607195	2026-01-09 16:57:46.607195	\N	RESERVE_PROFIT	0.00000000	\N	12
14	2026-01-09 16:58:02.44138	2026-01-09 16:58:02.44138	\N	RESERVE_PROFIT	94.44000000	\N	12
\.


--
-- Data for Name: free_usdt_distributions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.free_usdt_distributions (id, created_at, updated_at, deleted_at, platform_id, amount_usdt, distributed_by_user_id, comment) FROM stdin;
1	2026-01-09 17:23:00.738114	2026-01-09 17:23:00.738114	\N	6	36.00	12	\N
\.


--
-- Data for Name: free_usdt_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.free_usdt_entries (id, created_at, updated_at, deleted_at, conversion_id, pesos_amount, exchange_rate, usdt_amount, converted_by_user_id, confirmed_by_user_id, confirmed_at) FROM stdin;
4	2026-01-06 16:05:11.693189	2026-01-06 16:05:11.693189	\N	3	100000.00	1050.00	95.24	15	12	2026-01-05 02:57:15.876
5	2026-01-06 21:25:04.807352	2026-01-06 21:25:04.807352	\N	4	300000.00	1000.00	300.00	12	12	2026-01-06 18:25:04.806
6	2026-01-09 16:28:41.524917	2026-01-09 16:28:41.524917	\N	5	100000.00	900.00	111.11	17	12	2026-01-09 13:28:41.524
7	2026-01-09 16:30:00.273681	2026-01-09 16:30:00.273681	\N	6	50.00	0.50	100.00	12	12	2026-01-09 13:30:00.273
8	2026-01-09 16:30:46.15138	2026-01-09 16:30:46.15138	\N	7	110112.00	1000.00	110.11	12	12	2026-01-09 13:30:46.151
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1735053000000	AddPhoneAndTelegramToUser1735053000000
2	1735054000000	AddUserIdToDrops1735054000000
3	1735156800000	RenameLimitToLimitAmount1735156800000
4	1735574400000	RenameOperatorIdToUserId1735574400000
5	1735574500000	RemoveUserIdFromDrops1735574500000
6	1766702390516	ConvertToSnakeCase1766702390516
7	1736025600000	RefactorWorkingDepositSystem1736025600000
8	1736026800000	AddCashWithdrawalsTracking1736026800000
9	1736027200000	AddWithdrawalRateToCashWithdrawals1736027200000
10	1736028000000	RestoreExchangeRateToPlatform1736028000000
12	1767543595000	AddPlatformToDropNeoBank1767543595000
14	1767545659000	CreateNeoBankWithdrawals1767545659000
15	1767546000000	AddRateToDropNeoBank1767546000000
16	1767501033617	CreateSystemSettings1767501033617
17	1767547000000	SimplifyBalanceEntity1767547000000
18	1767548000000	MergeBalanceIntoPlatform1767548000000
19	1736028600000	RefactorBankAccountLimits1736028600000
20	1767549000000	MakeDropIdNullableInNeoBank1767549000000
21	1736029200000	AddStatusToPesoToUsdtConversion1736029200000
22	1736030400000	AddCommentToPesoToUsdtConversion1736030400000
23	1736109000000	AddAwaitingConfirmationStatus1736109000000
24	1736110000000	ConvertCashWithdrawalStatusToEnum1736110000000
25	1736120000000	CreateDailyProfitsTable1736120000000
26	1767713128631	MakeNeoBankProviderText1767713128631
27	1767550000000	AddFreeUsdtLedgerTables1767550000000
28	1769000000000	AddProfitReserveAndDeficitTables1769000000000
29	1769000100000	AddDailyAndMonthlyLimitToDropNeoBanks1769000100000
30	1769000200000	MakeDropIdRequiredInDropNeoBanks1769000200000
31	1769000300000	RenameDropNeoBankCommentToAlias1769000300000
32	1769000400000	AddFrozenAmountToDropNeoBanks1769000400000
33	1769000500000	CreateDropNeoBankFreezeEvents1769000500000
34	1769000600000	CreateBankAccountWithdrawnOperations1769000600000
35	1769000700000	BackfillBankAccountWithdrawnOperations1769000700000
36	1769000800000	BackfillBankAccountWithdrawnOperationsV21769000800000
\.


--
-- Data for Name: neo_bank_withdrawals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.neo_bank_withdrawals (id, created_at, updated_at, deleted_at, amount, neo_bank_id, bank_account_id, transaction_id, withdrawn_by_user_id, balance_before, balance_after, comment) FROM stdin;
2	2026-01-04 19:38:19.620863	2026-01-04 19:38:19.620863	\N	50000.00	3	2	2	14	1150000.00	1100000.00	\N
3	2026-01-04 23:23:10.328308	2026-01-04 23:23:10.328308	\N	100000.00	3	2	3	14	1100000.00	1000000.00	\N
4	2026-01-04 23:55:36.355157	2026-01-04 23:55:36.355157	\N	150000.00	4	2	4	14	1150000.00	1000000.00	\N
5	2026-01-04 23:58:31.469673	2026-01-04 23:58:31.469673	\N	100000.00	1	2	5	15	1100000.00	1000000.00	\N
6	2026-01-05 00:30:01.727375	2026-01-05 00:30:01.727375	\N	100000.00	1	8	6	15	1000000.00	900000.00	\N
7	2026-01-05 00:30:23.804097	2026-01-05 00:30:23.804097	\N	100000.00	1	8	7	15	900000.00	800000.00	\N
8	2026-01-05 20:49:29.243617	2026-01-05 20:49:29.243617	\N	200000.00	1	8	8	12	800000.00	600000.00	\N
9	2026-01-06 21:19:32.292116	2026-01-06 21:19:32.292116	\N	100000.00	3	8	9	12	1000000.00	900000.00	\N
10	2026-01-08 18:48:49.722743	2026-01-08 18:48:49.722743	\N	100000.00	3	8	10	17	900000.00	800000.00	\N
11	2026-01-08 18:52:11.865201	2026-01-08 18:52:11.865201	\N	100000.00	3	8	11	16	800000.00	700000.00	\N
12	2026-01-08 22:57:47.432755	2026-01-08 22:57:47.432755	\N	10.00	3	10	12	12	700000.00	699990.00	\N
13	2026-01-08 23:08:44.243495	2026-01-08 23:08:44.243495	\N	10.00	3	10	13	12	699990.00	699980.00	\N
14	2026-01-08 23:11:33.897343	2026-01-08 23:11:33.897343	\N	10.00	3	10	14	12	699980.00	699970.00	\N
15	2026-01-08 23:22:39.778922	2026-01-08 23:22:39.778922	\N	10.00	3	10	15	12	699970.00	699960.00	\N
16	2026-01-08 23:35:52.177084	2026-01-08 23:35:52.177084	\N	10.00	3	10	16	12	699960.00	699950.00	\N
17	2026-01-09 03:32:05.546626	2026-01-09 03:32:05.546626	\N	100000.00	6	7	17	12	100000.00	0.00	\N
18	2026-01-09 03:37:46.376991	2026-01-09 03:37:46.376991	\N	100000.00	6	7	18	12	100000.00	0.00	\N
19	2026-01-09 04:14:38.195351	2026-01-09 04:14:38.195351	\N	410000.00	6	7	19	12	410000.00	0.00	\N
20	2026-01-09 04:40:05.777686	2026-01-09 04:40:05.777686	\N	12.00	3	7	20	12	699962.00	699950.00	\N
21	2026-01-09 16:21:13.597743	2026-01-09 16:21:13.597743	\N	100.00	3	7	21	12	100.00	0.00	\N
\.


--
-- Data for Name: peso_to_usdt_conversions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.peso_to_usdt_conversions (id, pesos_amount, exchange_rate, usdt_amount, converted_by_user_id, created_at, updated_at, deleted_at, cash_withdrawal_id, status, comment) FROM stdin;
3	100000.00	1050.00	95.24	15	2026-01-05 02:31:36.904429	2026-01-05 02:57:15.876835	\N	\N	confirmed	\N
4	300000.00	1000.00	300.00	12	2026-01-06 21:24:37.267021	2026-01-06 21:25:04.802582	\N	\N	confirmed	\N
5	100000.00	900.00	111.11	17	2026-01-09 16:28:16.774358	2026-01-09 16:28:41.517074	\N	\N	confirmed	\N
6	50.00	0.50	100.00	12	2026-01-09 16:29:59.383048	2026-01-09 16:30:00.268284	\N	\N	confirmed	\N
7	110112.00	1000.00	110.11	12	2026-01-09 16:30:44.511003	2026-01-09 16:30:46.147	\N	\N	confirmed	\N
\.


--
-- Data for Name: platforms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platforms (id, created_at, updated_at, deleted_at, name, status, exchange_rate, balance) FROM stdin;
1	2026-01-04 17:47:32.212579	2026-01-06 16:42:09.437501	\N	Binance	active	1100.00	4000.00
2	2026-01-04 17:47:32.215022	2026-01-09 16:21:13.597743	\N	Bybit	active	1150.00	4099.91
6	2026-01-06 17:20:07.169668	2026-01-09 17:23:00.738114	\N	тест	active	0.00	36.00
\.


--
-- Data for Name: profit_reserves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profit_reserves (id, created_at, updated_at, deleted_at, date, amount_usdt, working_deposit_usdt, initial_deposit_usdt, created_by_user_id) FROM stdin;
\.


--
-- Data for Name: profits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profits (id, withdrawn_usdt, admin_rate, profit_pesos, returned_to_section, returned_amount_pesos, created_by_user_id, created_at, updated_at, deleted_at) FROM stdin;
1	86.00	1500.00	129000.00	unpaid_pesos	0.00	12	2026-01-06 20:12:57.880286	2026-01-06 20:12:57.880286	\N
2	94.44	1000.00	94440.00	unpaid_pesos	0.00	12	2026-01-09 16:58:02.44138	2026-01-09 16:58:02.44138	\N
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shifts (id, created_at, updated_at, deleted_at, start_time, end_time, duration, total_amount, operations_count, status, user_id, platform_id) FROM stdin;
3	2026-01-05 17:22:52.186328	2026-01-05 17:23:05.950798	\N	2026-01-05 14:22:52.182	2026-01-05 14:23:05.941	0	0.00	0	completed	12	2
4	2026-01-05 17:24:45.257086	2026-01-05 17:26:12.441077	\N	2026-01-05 14:24:45.255	2026-01-05 14:26:12.438	1	0.00	0	completed	12	1
5	2026-01-05 17:26:40.991816	2026-01-05 17:28:07.274906	\N	2026-01-05 14:26:40.994	2026-01-05 14:28:07.27	1	0.00	0	completed	12	2
6	2026-01-05 17:29:41.317886	2026-01-05 17:29:48.499524	\N	2026-01-05 14:29:41.317	2026-01-05 14:29:48.494	0	0.00	0	completed	12	1
7	2026-01-05 17:29:58.050853	2026-01-05 21:56:20.788736	\N	2026-01-05 14:29:58.051	2026-01-05 18:56:20.779	266	200000.00	1	completed	12	1
8	2026-01-05 21:56:30.409257	2026-01-06 01:59:35.587724	\N	2026-01-05 18:56:30.408	2026-01-05 22:59:35.58	243	0.00	0	completed	12	2
9	2026-01-06 02:02:22.066406	2026-01-06 15:00:28.332237	\N	2026-01-05 23:02:22.065	2026-01-06 12:00:28.324	778	0.00	0	completed	12	2
11	2026-01-08 18:48:25.12192	2026-01-08 18:48:49.722743	\N	2026-01-08 15:48:25.12	\N	\N	100000.00	1	active	17	2
12	2026-01-08 18:51:57.950458	2026-01-08 19:12:51.4892	\N	2026-01-08 15:51:57.949	2026-01-08 16:12:51.482	20	100000.00	1	completed	16	2
2	2026-01-04 23:57:45.951715	2026-01-08 19:20:20.570096	\N	2026-01-04 20:57:45.951	2026-01-08 16:20:20.564	5482	300000.00	3	completed	15	1
1	2026-01-04 19:07:32.361091	2026-01-08 19:20:51.93565	\N	2026-01-04 16:07:32.359	2026-01-08 16:20:51.929	5773	350000.00	4	completed	14	2
10	2026-01-06 15:00:40.807776	2026-01-09 16:21:13.597743	\N	2026-01-06 12:00:40.806	\N	\N	710162.00	11	active	12	2
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_settings (id, created_at, updated_at, deleted_at, key, value, description) FROM stdin;
3	2026-01-05 18:13:33.109596	2026-01-05 18:13:33.109596	\N	initial_deposit	9500	Initial working deposit in USDT
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, created_at, updated_at, deleted_at, amount, amount_usdt, status, comment, bank_account_id, shift_id, user_id, receipt, source_drop_neo_bank_id, exchange_rate, platform_id) FROM stdin;
2	2026-01-04 19:38:19.620863	2026-01-04 19:38:19.620863	\N	50000.00	43.4783	completed	\N	2	1	14	\N	3	1150.00	2
3	2026-01-04 23:23:10.328308	2026-01-04 23:23:10.328308	\N	100000.00	83.1760	completed	\N	2	1	14	\N	3	1202.27	2
4	2026-01-04 23:55:36.355157	2026-01-04 23:55:36.355157	\N	150000.00	130.4348	completed	\N	2	1	14	\N	4	1150.00	2
5	2026-01-04 23:58:31.469673	2026-01-04 23:58:31.469673	\N	100000.00	90.9091	completed	\N	2	2	15	\N	1	1100.00	1
6	2026-01-05 00:30:01.727375	2026-01-05 00:30:01.727375	\N	100000.00	90.9091	completed	\N	8	2	15	\N	1	1100.00	1
7	2026-01-05 00:30:23.804097	2026-01-05 00:30:23.804097	\N	100000.00	90.9091	completed	\N	8	2	15	\N	1	1100.00	1
8	2026-01-05 20:49:29.243617	2026-01-05 20:49:29.243617	\N	200000.00	181.8182	completed	\N	8	7	12	\N	1	1100.00	1
9	2026-01-06 21:19:32.292116	2026-01-06 21:19:32.292116	\N	100000.00	83.1760	completed	\N	8	10	12	\N	3	1202.27	2
10	2026-01-08 18:48:49.722743	2026-01-08 18:48:49.722743	\N	100000.00	83.1760	completed	\N	8	11	17	\N	3	1202.27	2
11	2026-01-08 18:52:11.865201	2026-01-08 18:52:11.865201	\N	100000.00	83.1760	completed	\N	8	12	16	\N	3	1202.27	2
12	2026-01-08 22:57:47.432755	2026-01-08 22:57:47.432755	\N	10.00	0.0083	completed	\N	10	10	12	\N	3	1202.27	2
13	2026-01-08 23:08:44.243495	2026-01-08 23:08:44.243495	\N	10.00	0.0083	completed	\N	10	10	12	\N	3	1202.27	2
14	2026-01-08 23:11:33.897343	2026-01-08 23:11:33.897343	\N	10.00	0.0083	completed	\N	10	10	12	\N	3	1202.27	2
15	2026-01-08 23:22:39.778922	2026-01-08 23:22:39.778922	\N	10.00	0.0083	completed	\N	10	10	12	\N	3	1202.27	2
16	2026-01-08 23:35:52.177084	2026-01-08 23:35:52.177084	\N	10.00	0.0083	completed	\N	10	10	12	\N	3	1202.27	2
17	2026-01-09 03:32:05.546626	2026-01-09 03:32:05.546626	\N	100000.00	86.9565	completed	\N	7	10	12	\N	6	1150.00	2
18	2026-01-09 03:37:46.376991	2026-01-09 03:37:46.376991	\N	100000.00	86.9565	completed	\N	7	10	12	\N	6	1150.00	2
19	2026-01-09 04:14:38.195351	2026-01-09 04:14:38.195351	\N	410000.00	356.5217	completed	\N	7	10	12	\N	6	1150.00	2
20	2026-01-09 04:40:05.777686	2026-01-09 04:40:05.777686	\N	12.00	0.0104	completed	\N	7	10	12	\N	3	1150.00	2
21	2026-01-09 16:21:13.597743	2026-01-09 16:21:13.597743	\N	100.00	0.0870	completed	\N	7	10	12	\N	3	1150.00	2
\.


--
-- Data for Name: usdt_to_peso_exchanges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usdt_to_peso_exchanges (id, platform_id, neo_bank_id, usdt_amount, exchange_rate, pesos_amount, created_by_user_id, created_at, updated_at, deleted_at) FROM stdin;
1	1	1	45.45	1100.00	49995.00	12	2026-01-06 16:42:09.437501	2026-01-06 16:42:09.437501	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, created_at, updated_at, deleted_at, username, email, password, role, status, two_factor_secret, two_factor_enabled, phone, telegram) FROM stdin;
17	2025-12-24 16:09:10.726515	2026-01-08 18:25:59.483132	\N	operator3	operator3@example.com	$2b$10$1dQL16mfQRopc4pOkxSAk.4nfYzLkMVydk/I/FC91SR5ukkhcIOj6	teamlead	active	EVXDKUKGFRFHQ5KMEQ6HK3ZXORPDAJSUGNACQIKMKZJD623TLV5A	t	89684009222	@one333
16	2025-12-24 16:08:35.144278	2026-01-08 19:56:55.979244	2026-01-08 19:56:55.979244	operator1	operator1@example.com	$2b$10$FDGBn7l3UBQZz8pcZ0twrevSFyDyZGQpj5L.A0a3Xeeb42QnkTUUq	operator	inactive	IMYVMRSLKY3U45T5NUQT6SRXPJ4UUI35OU2E2UJ2OU4GOQL5ENFQ	t	89684009111	\N
18	2026-01-08 16:34:55.475228	2026-01-08 18:47:14.356153	2026-01-08 18:47:14.356153	тест2	test2@gmail.com	$2b$10$wTcVcMW5e2dknQNslV50lOCcu3Uvui3OdCOI0KSwhHr/POetalFG2	operator	inactive	JQZXSLDRI4THEKSMGBNXK2DREVYV2ZLHKY2GKRJOHFDC6R3PPJJA	f		
12	2025-12-23 01:21:33.966052	2026-01-08 21:14:16.564765	\N	админ	admin@example.com	$2b$10$ruFK5eVJb8TDJ00AkXodoenPqUpfP91lwDfuQjhbg54uGVe3NpMJq	admin	active	KQSGOVCNI5HGMUTNJY7EA3SUOUUC4UD3MFLD6YJ3FAUUSZCKMVZA	t		@onevan
15	2025-12-23 01:28:23.640567	2025-12-23 01:29:16.543563	\N	тимлид	teamlead@example.com	$2b$10$j0jq7BDTDmWfjk9PhlNQru90aGGqjtWTzPXXtZTBTjMeYbr8Lk9QO	teamlead	active	JZGWOIZMKZRXUUL2KZBWKRLSLM7HEUCQGUVEAPCAORJC64JRPJAA	t		
14	2025-12-23 01:27:07.979955	2025-12-23 01:28:01.12243	\N	оператор	operator@example.com	$2b$10$uiOHolYs/5Loumq/Ggm7q.pwzKjlcQPDurJVUMVPfx63D3Jm2Y8n2	operator	active	M5DT422BG4XEQUCVFYWFGKDFLASEAJSJI5QXI5TNO5ETOOB7LVVQ	t	89684009298	@onevan
\.


--
-- Name: balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.balances_id_seq', 1, false);


--
-- Name: bank_account_withdrawn_operations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_account_withdrawn_operations_id_seq', 50, true);


--
-- Name: bank_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_accounts_id_seq', 11, true);


--
-- Name: banks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banks_id_seq', 6, true);


--
-- Name: cash_withdrawals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cash_withdrawals_id_seq', 8, true);


--
-- Name: deficit_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.deficit_records_id_seq', 4, true);


--
-- Name: drop_neo_bank_freeze_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drop_neo_bank_freeze_events_id_seq', 6, true);


--
-- Name: drop_neo_banks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drop_neo_banks_id_seq', 9, true);


--
-- Name: drops_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drops_id_seq', 3, true);


--
-- Name: exchange_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exchange_rates_id_seq', 1, false);


--
-- Name: free_usdt_adjustments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.free_usdt_adjustments_id_seq', 14, true);


--
-- Name: free_usdt_distributions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.free_usdt_distributions_id_seq', 1, true);


--
-- Name: free_usdt_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.free_usdt_entries_id_seq', 8, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 36, true);


--
-- Name: neo_bank_withdrawals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.neo_bank_withdrawals_id_seq', 21, true);


--
-- Name: peso_to_usdt_conversions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.peso_to_usdt_conversions_id_seq', 7, true);


--
-- Name: platforms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.platforms_id_seq', 6, true);


--
-- Name: profit_reserves_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profit_reserves_id_seq', 5, true);


--
-- Name: profits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profits_id_seq', 2, true);


--
-- Name: shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shifts_id_seq', 12, true);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 3, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 21, true);


--
-- Name: usdt_to_peso_exchanges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usdt_to_peso_exchanges_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 18, true);


--
-- Name: bank_account_withdrawn_operations PK_0daa717fbb7f4beab1e8ca4068d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_account_withdrawn_operations
    ADD CONSTRAINT "PK_0daa717fbb7f4beab1e8ca4068d" PRIMARY KEY (id);


--
-- Name: banks PK_3975b5f684ec241e3901db62d77; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks
    ADD CONSTRAINT "PK_3975b5f684ec241e3901db62d77" PRIMARY KEY (id);


--
-- Name: platforms PK_3b879853678f7368d46e52b81c6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platforms
    ADD CONSTRAINT "PK_3b879853678f7368d46e52b81c6" PRIMARY KEY (id);


--
-- Name: balances PK_74904758e813e401abc3d4261c2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balances
    ADD CONSTRAINT "PK_74904758e813e401abc3d4261c2" PRIMARY KEY (id);


--
-- Name: system_settings PK_82521f08790d248b2a80cc85d40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT "PK_82521f08790d248b2a80cc85d40" PRIMARY KEY (id);


--
-- Name: shifts PK_84d692e367e4d6cdf045828768c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT "PK_84d692e367e4d6cdf045828768c" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: free_usdt_distributions PK_93ae3c765dacf38519ff80b5be7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.free_usdt_distributions
    ADD CONSTRAINT "PK_93ae3c765dacf38519ff80b5be7" PRIMARY KEY (id);


--
-- Name: drops PK_98faa8bfa444b9f5a4980f7a847; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drops
    ADD CONSTRAINT "PK_98faa8bfa444b9f5a4980f7a847" PRIMARY KEY (id);


--
-- Name: transactions PK_a219afd8dd77ed80f5a862f1db9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: neo_bank_withdrawals PK_ae2a9f27ced6a8a6afa6466fcab; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neo_bank_withdrawals
    ADD CONSTRAINT "PK_ae2a9f27ced6a8a6afa6466fcab" PRIMARY KEY (id);


--
-- Name: drop_neo_banks PK_c39bbc42c8a13337131b7a78b25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drop_neo_banks
    ADD CONSTRAINT "PK_c39bbc42c8a13337131b7a78b25" PRIMARY KEY (id);


--
-- Name: bank_accounts PK_c872de764f2038224a013ff25ed; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT "PK_c872de764f2038224a013ff25ed" PRIMARY KEY (id);


--
-- Name: daily_profits PK_dd10ecadf29c1952619638f6d9f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_profits
    ADD CONSTRAINT "PK_dd10ecadf29c1952619638f6d9f" PRIMARY KEY (id);


--
-- Name: deficit_records PK_deficit_records_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deficit_records
    ADD CONSTRAINT "PK_deficit_records_id" PRIMARY KEY (id);


--
-- Name: free_usdt_entries PK_fad9502faa3557b5f87df1d85a5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.free_usdt_entries
    ADD CONSTRAINT "PK_fad9502faa3557b5f87df1d85a5" PRIMARY KEY (id);


--
-- Name: free_usdt_adjustments PK_free_usdt_adjustments_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.free_usdt_adjustments
    ADD CONSTRAINT "PK_free_usdt_adjustments_id" PRIMARY KEY (id);


--
-- Name: profit_reserves PK_profit_reserves_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profit_reserves
    ADD CONSTRAINT "PK_profit_reserves_id" PRIMARY KEY (id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: bank_accounts UQ_9925062b6d681adf574278a3a97; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT "UQ_9925062b6d681adf574278a3a97" UNIQUE (cbu);


--
-- Name: peso_to_usdt_conversions UQ_aa512168596e533c72a2d43b138; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peso_to_usdt_conversions
    ADD CONSTRAINT "UQ_aa512168596e533c72a2d43b138" UNIQUE (cash_withdrawal_id);


--
-- Name: system_settings UQ_b1b5bc664526d375c94ce9ad43d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT "UQ_b1b5bc664526d375c94ce9ad43d" UNIQUE (key);


--
-- Name: daily_profits UQ_c553858b5e2416785c609d82b59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_profits
    ADD CONSTRAINT "UQ_c553858b5e2416785c609d82b59" UNIQUE (date);


--
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- Name: cash_withdrawals cash_withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_withdrawals
    ADD CONSTRAINT cash_withdrawals_pkey PRIMARY KEY (id);


--
-- Name: drop_neo_bank_freeze_events drop_neo_bank_freeze_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drop_neo_bank_freeze_events
    ADD CONSTRAINT drop_neo_bank_freeze_events_pkey PRIMARY KEY (id);


--
-- Name: exchange_rates exchange_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT exchange_rates_pkey PRIMARY KEY (id);


--
-- Name: peso_to_usdt_conversions peso_to_usdt_conversions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peso_to_usdt_conversions
    ADD CONSTRAINT peso_to_usdt_conversions_pkey PRIMARY KEY (id);


--
-- Name: profits profits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profits
    ADD CONSTRAINT profits_pkey PRIMARY KEY (id);


--
-- Name: usdt_to_peso_exchanges usdt_to_peso_exchanges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usdt_to_peso_exchanges
    ADD CONSTRAINT usdt_to_peso_exchanges_pkey PRIMARY KEY (id);


--
-- Name: IDX_bank_account_withdrawn_operations_bank_account_id_created_a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_bank_account_withdrawn_operations_bank_account_id_created_a" ON public.bank_account_withdrawn_operations USING btree (bank_account_id, created_at);


--
-- Name: IDX_daily_profits_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_daily_profits_date" ON public.daily_profits USING btree (date);


--
-- Name: IDX_free_usdt_adjustments_reason; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_free_usdt_adjustments_reason" ON public.free_usdt_adjustments USING btree (reason);


--
-- Name: IDX_free_usdt_distributions_distributed_by_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_free_usdt_distributions_distributed_by_user_id" ON public.free_usdt_distributions USING btree (distributed_by_user_id);


--
-- Name: IDX_free_usdt_distributions_platform_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_free_usdt_distributions_platform_id" ON public.free_usdt_distributions USING btree (platform_id);


--
-- Name: IDX_free_usdt_entries_conversion_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_free_usdt_entries_conversion_id_unique" ON public.free_usdt_entries USING btree (conversion_id);


--
-- Name: UQ_deficit_records_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UQ_deficit_records_date" ON public.deficit_records USING btree (date);


--
-- Name: UQ_profit_reserves_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UQ_profit_reserves_date" ON public.profit_reserves USING btree (date);


--
-- Name: idx_drop_neo_bank_freeze_events_neo_bank_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_drop_neo_bank_freeze_events_neo_bank_id ON public.drop_neo_bank_freeze_events USING btree (neo_bank_id);


--
-- Name: drop_neo_banks FK_0023d1f23519f10e7eb01c54fdc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drop_neo_banks
    ADD CONSTRAINT "FK_0023d1f23519f10e7eb01c54fdc" FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: transactions FK_01104ff398fc4425fbfbc96a7fe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "FK_01104ff398fc4425fbfbc96a7fe" FOREIGN KEY (source_drop_neo_bank_id) REFERENCES public.drop_neo_banks(id);


--
-- Name: bank_account_withdrawn_operations FK_021a275f471bcdc8b6de26dcb5a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_account_withdrawn_operations
    ADD CONSTRAINT "FK_021a275f471bcdc8b6de26dcb5a" FOREIGN KEY (platform_id) REFERENCES public.platforms(id) ON DELETE SET NULL;


--
-- Name: drop_neo_banks FK_15ec45c31c99a56e43f7a85fac9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drop_neo_banks
    ADD CONSTRAINT "FK_15ec45c31c99a56e43f7a85fac9" FOREIGN KEY (drop_id) REFERENCES public.drops(id);


--
-- Name: free_usdt_entries FK_20dbf28ca9d313f90ad83bb161b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.free_usdt_entries
    ADD CONSTRAINT "FK_20dbf28ca9d313f90ad83bb161b" FOREIGN KEY (converted_by_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: bank_account_withdrawn_operations FK_3debede35c6577cd8bd5b5c180f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_account_withdrawn_operations
    ADD CONSTRAINT "FK_3debede35c6577cd8bd5b5c180f" FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: free_usdt_distributions FK_3df5bae5c7c996b9e4d34a4e3b4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.free_usdt_distributions
    ADD CONSTRAINT "FK_3df5bae5c7c996b9e4d34a4e3b4" FOREIGN KEY (platform_id) REFERENCES public.platforms(id) ON DELETE RESTRICT;


--
-- Name: bank_accounts FK_482543ba26483726aaa00d39174; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT "FK_482543ba26483726aaa00d39174" FOREIGN KEY (bank_id) REFERENCES public.banks(id);


--
-- Name: exchange_rates FK_5a74b7fdfad7d03fdc7c0dc2daa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT "FK_5a74b7fdfad7d03fdc7c0dc2daa" FOREIGN KEY (set_by_user_id) REFERENCES public.users(id);


--
-- Name: bank_account_withdrawn_operations FK_63093810a3a8731d001fdee07b7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_account_withdrawn_operations
    ADD CONSTRAINT "FK_63093810a3a8731d001fdee07b7" FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id) ON DELETE CASCADE;


--
-- Name: neo_bank_withdrawals FK_6e40b1112bf6be52a8101ba629c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neo_bank_withdrawals
    ADD CONSTRAINT "FK_6e40b1112bf6be52a8101ba629c" FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);


--
-- Name: usdt_to_peso_exchanges FK_740e2770d2680f833d557fba585; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usdt_to_peso_exchanges
    ADD CONSTRAINT "FK_740e2770d2680f833d557fba585" FOREIGN KEY (neo_bank_id) REFERENCES public.drop_neo_banks(id);


--
-- Name: neo_bank_withdrawals FK_7497705949f063879a88d5787d2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neo_bank_withdrawals
    ADD CONSTRAINT "FK_7497705949f063879a88d5787d2" FOREIGN KEY (neo_bank_id) REFERENCES public.drop_neo_banks(id);


--
-- Name: transactions FK_7acbae8c628ce8a11e882cac50f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "FK_7acbae8c628ce8a11e882cac50f" FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id);


--
-- Name: usdt_to_peso_exchanges FK_870c6f6741b3653d520972474f8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usdt_to_peso_exchanges
    ADD CONSTRAINT "FK_870c6f6741b3653d520972474f8" FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: bank_account_withdrawn_operations FK_8cd37faeae3ec7ed2bf17578d7c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_account_withdrawn_operations
    ADD CONSTRAINT "FK_8cd37faeae3ec7ed2bf17578d7c" FOREIGN KEY (cash_withdrawal_id) REFERENCES public.cash_withdrawals(id) ON DELETE SET NULL;


--
-- Name: transactions FK_90f81b6cba4523fc2d8e794458e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "FK_90f81b6cba4523fc2d8e794458e" FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: bank_account_withdrawn_operations FK_92fdec27f779f8a8e6db0c2864d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_account_withdrawn_operations
    ADD CONSTRAINT "FK_92fdec27f779f8a8e6db0c2864d" FOREIGN KEY (source_drop_neo_bank_id) REFERENCES public.drop_neo_banks(id) ON DELETE SET NULL;


--
-- Name: free_usdt_entries FK_989f4236793027bd8a43006a896; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.free_usdt_entries
    ADD CONSTRAINT "FK_989f4236793027bd8a43006a896" FOREIGN KEY (conversion_id) REFERENCES public.peso_to_usdt_conversions(id) ON DELETE RESTRICT;


--
-- Name: neo_bank_withdrawals FK_a0b2949ac72f2cc0a20f5f8724e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neo_bank_withdrawals
    ADD CONSTRAINT "FK_a0b2949ac72f2cc0a20f5f8724e" FOREIGN KEY (withdrawn_by_user_id) REFERENCES public.users(id);


--
-- Name: transactions FK_a8d3ae44663921129bda4dcf6df; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "FK_a8d3ae44663921129bda4dcf6df" FOREIGN KEY (shift_id) REFERENCES public.shifts(id);


--
-- Name: peso_to_usdt_conversions FK_aa512168596e533c72a2d43b138; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peso_to_usdt_conversions
    ADD CONSTRAINT "FK_aa512168596e533c72a2d43b138" FOREIGN KEY (cash_withdrawal_id) REFERENCES public.cash_withdrawals(id);


--
-- Name: peso_to_usdt_conversions FK_abcc37a2d19a34f99b7854d98ef; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peso_to_usdt_conversions
    ADD CONSTRAINT "FK_abcc37a2d19a34f99b7854d98ef" FOREIGN KEY (converted_by_user_id) REFERENCES public.users(id);


--
-- Name: shifts FK_ac4e9980eea71cd9d1ee9f61e3b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT "FK_ac4e9980eea71cd9d1ee9f61e3b" FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: bank_accounts FK_ac67bec8d2bd13c062fae3cd65d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT "FK_ac67bec8d2bd13c062fae3cd65d" FOREIGN KEY (drop_id) REFERENCES public.drops(id);


--
-- Name: bank_account_withdrawn_operations FK_bb8bd733326bb8be5d6968447a6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_account_withdrawn_operations
    ADD CONSTRAINT "FK_bb8bd733326bb8be5d6968447a6" FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL;


--
-- Name: free_usdt_entries FK_caa9e93dec1aae92b94fcc506b2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.free_usdt_entries
    ADD CONSTRAINT "FK_caa9e93dec1aae92b94fcc506b2" FOREIGN KEY (confirmed_by_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: balances FK_ce3c66a8c642b50279fac508fbc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balances
    ADD CONSTRAINT "FK_ce3c66a8c642b50279fac508fbc" FOREIGN KEY (platform_id) REFERENCES public.platforms(id);


--
-- Name: usdt_to_peso_exchanges FK_d5f6df37e643bc64c69db55aff8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usdt_to_peso_exchanges
    ADD CONSTRAINT "FK_d5f6df37e643bc64c69db55aff8" FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);


--
-- Name: shifts FK_dc1e84f1d1e75e990952c40859c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT "FK_dc1e84f1d1e75e990952c40859c" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: deficit_records FK_deficit_records_created_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deficit_records
    ADD CONSTRAINT "FK_deficit_records_created_by_user" FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: free_usdt_distributions FK_e81341dd7bd84cd2060ed18bb65; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.free_usdt_distributions
    ADD CONSTRAINT "FK_e81341dd7bd84cd2060ed18bb65" FOREIGN KEY (distributed_by_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: transactions FK_e9acc6efa76de013e8c1553ed2b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: profits FK_ea1a52f1c7c68640d3a38580c70; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profits
    ADD CONSTRAINT "FK_ea1a52f1c7c68640d3a38580c70" FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);


--
-- Name: neo_bank_withdrawals FK_f30841c29dd543fbef2f06dad08; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neo_bank_withdrawals
    ADD CONSTRAINT "FK_f30841c29dd543fbef2f06dad08" FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- Name: cash_withdrawals FK_feedbec5e11314884cfdf65456f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_withdrawals
    ADD CONSTRAINT "FK_feedbec5e11314884cfdf65456f" FOREIGN KEY (withdrawn_by_user_id) REFERENCES public.users(id);


--
-- Name: free_usdt_adjustments FK_free_usdt_adjustments_created_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.free_usdt_adjustments
    ADD CONSTRAINT "FK_free_usdt_adjustments_created_by_user" FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: free_usdt_adjustments FK_free_usdt_adjustments_profit_reserve; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.free_usdt_adjustments
    ADD CONSTRAINT "FK_free_usdt_adjustments_profit_reserve" FOREIGN KEY (profit_reserve_id) REFERENCES public.profit_reserves(id) ON DELETE SET NULL;


--
-- Name: profit_reserves FK_profit_reserves_created_by_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profit_reserves
    ADD CONSTRAINT "FK_profit_reserves_created_by_user" FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: drop_neo_bank_freeze_events fk_drop_neo_bank_freeze_events_neo_bank; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drop_neo_bank_freeze_events
    ADD CONSTRAINT fk_drop_neo_bank_freeze_events_neo_bank FOREIGN KEY (neo_bank_id) REFERENCES public.drop_neo_banks(id) ON DELETE CASCADE;


--
-- Name: drop_neo_bank_freeze_events fk_drop_neo_bank_freeze_events_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drop_neo_bank_freeze_events
    ADD CONSTRAINT fk_drop_neo_bank_freeze_events_user FOREIGN KEY (performed_by_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

