-- Seed admin settings for intake and matching configuration
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
-- Intake & Access settings
('allow_custom_request_without_login', '{"enabled": true}'),

-- Matching configuration settings
('matching_weights', '{"skills":0.25,"domain":0.15,"outcomes":0.20,"availability":0.15,"locale":0.05,"price":0.10,"vetting":0.07,"history":0.03}'),
('shortlist_size_default', '{"value":3}'),
('max_quotes_per_request', '{"value":3}'),
('min_quotes_before_presenting', '{"value":2}'),
('invite_response_sla_hours', '{"value":24}'),
('conflict_window_days', '{"value":60}'),
('sensitive_single_provider_only', '{"enabled":false}')

ON CONFLICT (setting_key) DO NOTHING;