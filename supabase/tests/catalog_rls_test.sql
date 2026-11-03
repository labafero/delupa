BEGIN;

SELECT plan(2);

INSERT INTO public.products (name, price_cents, status)
VALUES
  ('Catalog RLS active fixture', 100, 'active'),
  ('Catalog RLS archived fixture', 100, 'archived');

SET LOCAL ROLE anon;

SELECT is(
  (SELECT count(*)::integer FROM public.products WHERE name = 'Catalog RLS active fixture'),
  1,
  'anonymous users can read active products'
);
SELECT is(
  (SELECT count(*)::integer FROM public.products WHERE name = 'Catalog RLS archived fixture'),
  0,
  'anonymous users cannot read archived products'
);

SELECT * FROM finish();
ROLLBACK;
