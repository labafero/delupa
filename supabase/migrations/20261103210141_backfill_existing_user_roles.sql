INSERT INTO public.user_roles (user_id, role)
SELECT id, 'client'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
