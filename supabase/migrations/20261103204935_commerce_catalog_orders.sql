CREATE TYPE public.product_status AS ENUM ('active', 'archived');
CREATE TYPE public.order_fulfillment AS ENUM ('delivery', 'pickup');
CREATE TYPE public.order_payment_method AS ENUM ('manual_pix', 'cash_at_delivery', 'cash_at_pickup');
CREATE TYPE public.order_payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE public.order_status AS ENUM (
  'awaiting_payment',
  'paid',
  'preparing',
  'out_for_delivery',
  'awaiting_pickup',
  'completed',
  'cancelled',
  'refunded'
);

CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
CREATE POLICY profiles_read_self_or_admin
  ON public.profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT private.has_app_role('admin'::public.app_role)));

CREATE OR REPLACE FUNCTION private.sync_delupa_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  INSERT INTO public.profiles (user_id, email, updated_at)
  VALUES (NEW.id, COALESCE(NEW.email, ''), now())
  ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email, updated_at = now();

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.sync_delupa_auth_user() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS on_auth_user_created_assign_delupa_role ON auth.users;
CREATE TRIGGER on_auth_user_created_sync_delupa_user
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.sync_delupa_auth_user();

INSERT INTO public.profiles (user_id, email)
SELECT id, COALESCE(email, '') FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, updated_at = now();

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  unit text NOT NULL DEFAULT 'unidade' CHECK (length(trim(unit)) BETWEEN 1 AND 24),
  quantity_available integer NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  online_limit integer NOT NULL DEFAULT 2 CHECK (online_limit > 0),
  image_path text,
  status public.product_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.product_private (
  product_id uuid PRIMARY KEY REFERENCES public.products (id) ON DELETE CASCADE,
  acquisition_cost_cents integer NOT NULL DEFAULT 0 CHECK (acquisition_cost_cents >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_private ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.products, public.product_private FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.product_private TO authenticated;

CREATE POLICY products_read_catalog
  ON public.products FOR SELECT TO anon, authenticated
  USING (status = 'active' OR (SELECT private.has_app_role('admin'::public.app_role)));
CREATE POLICY products_admin_insert
  ON public.products FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.has_app_role('admin'::public.app_role)));
CREATE POLICY products_admin_update
  ON public.products FOR UPDATE TO authenticated
  USING ((SELECT private.has_app_role('admin'::public.app_role)))
  WITH CHECK ((SELECT private.has_app_role('admin'::public.app_role)));
CREATE POLICY products_admin_delete
  ON public.products FOR DELETE TO authenticated
  USING ((SELECT private.has_app_role('admin'::public.app_role)));
CREATE POLICY product_private_admin_all
  ON public.product_private FOR ALL TO authenticated
  USING ((SELECT private.has_app_role('admin'::public.app_role)))
  WITH CHECK ((SELECT private.has_app_role('admin'::public.app_role)));

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.profiles (user_id),
  pickup_code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  status public.order_status NOT NULL DEFAULT 'awaiting_payment',
  payment_method public.order_payment_method NOT NULL,
  payment_status public.order_payment_status NOT NULL DEFAULT 'pending',
  fulfillment public.order_fulfillment NOT NULL,
  delivery_address text,
  delivery_instructions text,
  total_cents integer NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  created_by uuid NOT NULL REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (fulfillment = 'delivery' OR delivery_address IS NULL)
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products (id) ON DELETE SET NULL,
  product_name text NOT NULL,
  unit text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  line_total_cents integer GENERATED ALWAYS AS (quantity * unit_price_cents) STORED
);

CREATE TABLE public.order_status_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  old_status public.order_status,
  new_status public.order_status NOT NULL,
  changed_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id),
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.orders, public.order_items, public.order_status_history FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.orders, public.order_items, public.order_status_history TO authenticated;
GRANT INSERT, UPDATE ON TABLE public.orders TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.order_status_history_id_seq TO authenticated;

CREATE POLICY orders_read_customer_or_admin
  ON public.orders FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = customer_id OR (SELECT private.has_app_role('admin'::public.app_role)));
CREATE POLICY orders_admin_insert
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.has_app_role('admin'::public.app_role)) AND created_by = (SELECT auth.uid()));
CREATE POLICY orders_admin_update
  ON public.orders FOR UPDATE TO authenticated
  USING ((SELECT private.has_app_role('admin'::public.app_role)))
  WITH CHECK ((SELECT private.has_app_role('admin'::public.app_role)));
CREATE POLICY order_items_read_customer_or_admin
  ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id
      AND (o.customer_id = (SELECT auth.uid()) OR (SELECT private.has_app_role('admin'::public.app_role)))
  ));
CREATE POLICY order_items_admin_write
  ON public.order_items FOR ALL TO authenticated
  USING ((SELECT private.has_app_role('admin'::public.app_role)))
  WITH CHECK ((SELECT private.has_app_role('admin'::public.app_role)));
CREATE POLICY order_history_read_customer_or_admin
  ON public.order_status_history FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id
      AND (o.customer_id = (SELECT auth.uid()) OR (SELECT private.has_app_role('admin'::public.app_role)))
  ));
CREATE POLICY order_history_admin_insert
  ON public.order_status_history FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.has_app_role('admin'::public.app_role)) AND changed_by = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION private.record_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_status_history (order_id, old_status, new_status, changed_by)
    VALUES (NEW.id, CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END, NEW.status, COALESCE(auth.uid(), NEW.created_by));
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.record_order_status_change() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_order_status_changed
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION private.record_order_status_change();

CREATE OR REPLACE FUNCTION public.create_admin_order(
  p_customer_id uuid,
  p_fulfillment public.order_fulfillment,
  p_payment_method public.order_payment_method,
  p_delivery_address text,
  p_delivery_instructions text,
  p_items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  created_order_id uuid;
  item jsonb;
  chosen_product public.products%ROWTYPE;
  item_quantity integer;
  computed_total bigint := 0;
BEGIN
  IF NOT (SELECT private.has_app_role('admin'::public.app_role)) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'at least one item is required' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = p_customer_id) THEN
    RAISE EXCEPTION 'customer does not exist' USING ERRCODE = '22023';
  END IF;
  IF p_fulfillment = 'delivery' AND NULLIF(trim(p_delivery_address), '') IS NULL THEN
    RAISE EXCEPTION 'delivery address is required' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.orders (
    customer_id, payment_method, fulfillment, delivery_address, delivery_instructions, created_by
  ) VALUES (
    p_customer_id, p_payment_method, p_fulfillment,
    NULLIF(trim(p_delivery_address), ''), NULLIF(trim(p_delivery_instructions), ''), auth.uid()
  ) RETURNING id INTO created_order_id;

  FOR item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO chosen_product
    FROM public.products
    WHERE id = (item->>'product_id')::uuid AND status = 'active';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'active product not found' USING ERRCODE = '22023';
    END IF;
    item_quantity := (item->>'quantity')::integer;
    IF item_quantity <= 0 THEN
      RAISE EXCEPTION 'quantity must be positive' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.order_items (
      order_id, product_id, product_name, unit, quantity, unit_price_cents
    ) VALUES (
      created_order_id, chosen_product.id, chosen_product.name, chosen_product.unit,
      item_quantity, chosen_product.price_cents
    );
    computed_total := computed_total + (item_quantity::bigint * chosen_product.price_cents);
  END LOOP;

  IF computed_total > 2147483647 THEN
    RAISE EXCEPTION 'order total exceeds limit' USING ERRCODE = '22003';
  END IF;
  UPDATE public.orders SET total_cents = computed_total::integer WHERE id = created_order_id;
  RETURN created_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_admin_order(uuid, public.order_fulfillment, public.order_payment_method, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_admin_order(uuid, public.order_fulfillment, public.order_payment_method, text, text, jsonb) TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY product_images_public_read
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');
CREATE POLICY product_images_admin_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND (SELECT private.has_app_role('admin'::public.app_role)));
CREATE POLICY product_images_admin_update
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND (SELECT private.has_app_role('admin'::public.app_role)))
  WITH CHECK (bucket_id = 'product-images' AND (SELECT private.has_app_role('admin'::public.app_role)));
CREATE POLICY product_images_admin_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND (SELECT private.has_app_role('admin'::public.app_role)));
