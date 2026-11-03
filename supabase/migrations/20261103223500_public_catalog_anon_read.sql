DROP POLICY IF EXISTS products_read_catalog ON public.products;

CREATE POLICY products_read_active_catalog
  ON public.products FOR SELECT TO anon
  USING (status = 'active');

CREATE POLICY products_read_catalog_authenticated
  ON public.products FOR SELECT TO authenticated
  USING (status = 'active' OR (SELECT private.has_app_role('admin'::public.app_role)));
