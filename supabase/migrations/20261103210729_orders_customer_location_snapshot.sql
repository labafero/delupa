ALTER TABLE public.orders
  ADD COLUMN customer_email text,
  ADD COLUMN pickup_location text;

UPDATE public.orders AS orders
SET customer_email = profiles.email
FROM public.profiles AS profiles
WHERE profiles.user_id = orders.customer_id;

ALTER TABLE public.orders
  ALTER COLUMN customer_email SET NOT NULL,
  ADD CONSTRAINT orders_fulfillment_location_check CHECK (
    (fulfillment = 'delivery' AND pickup_location IS NULL)
    OR (fulfillment = 'pickup' AND delivery_address IS NULL)
  );

DROP FUNCTION public.create_admin_order(
  uuid, public.order_fulfillment, public.order_payment_method, text, text, jsonb
);

CREATE FUNCTION public.create_admin_order(
  p_customer_id uuid,
  p_fulfillment public.order_fulfillment,
  p_payment_method public.order_payment_method,
  p_fulfillment_location text,
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
  customer_email_snapshot text;
BEGIN
  IF NOT (SELECT private.has_app_role('admin'::public.app_role)) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'at least one item is required' USING ERRCODE = '22023';
  END IF;
  SELECT email INTO customer_email_snapshot
  FROM public.profiles
  WHERE user_id = p_customer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'customer does not exist' USING ERRCODE = '22023';
  END IF;
  IF NULLIF(trim(p_fulfillment_location), '') IS NULL THEN
    RAISE EXCEPTION 'fulfillment location is required' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.orders (
    customer_id, customer_email, payment_method, fulfillment,
    delivery_address, pickup_location, delivery_instructions, created_by
  ) VALUES (
    p_customer_id, customer_email_snapshot, p_payment_method, p_fulfillment,
    CASE WHEN p_fulfillment = 'delivery' THEN NULLIF(trim(p_fulfillment_location), '') END,
    CASE WHEN p_fulfillment = 'pickup' THEN NULLIF(trim(p_fulfillment_location), '') END,
    NULLIF(trim(p_delivery_instructions), ''), auth.uid()
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

REVOKE ALL ON FUNCTION public.create_admin_order(
  uuid, public.order_fulfillment, public.order_payment_method, text, text, jsonb
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_admin_order(
  uuid, public.order_fulfillment, public.order_payment_method, text, text, jsonb
) TO authenticated;
