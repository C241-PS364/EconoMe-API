-- Table: public.incomes

-- DROP TABLE IF EXISTS public.incomes;

CREATE TABLE IF NOT EXISTS public.incomes
(
    id integer NOT NULL DEFAULT nextval('incomes_id_seq'::regclass),
    date date NOT NULL,
    title character varying(100) COLLATE pg_catalog."default" NOT NULL,
    amount numeric(10,2) NOT NULL,
    user_uuid uuid,
    CONSTRAINT incomes_pkey PRIMARY KEY (id),
    CONSTRAINT incomes_user_uuid_fkey FOREIGN KEY (user_uuid)
        REFERENCES public.users (uuid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.incomes
    OWNER to postgres;
