-- Enable leaked password protection for enhanced security
INSERT INTO auth.config (parameter, value) 
VALUES ('password_min_length', '8')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO auth.config (parameter, value) 
VALUES ('password_require_lowercase', 'true')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO auth.config (parameter, value) 
VALUES ('password_require_uppercase', 'true')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO auth.config (parameter, value) 
VALUES ('password_require_numbers', 'true')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO auth.config (parameter, value) 
VALUES ('password_require_symbols', 'true')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO auth.config (parameter, value) 
VALUES ('password_hibp_enabled', 'true')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;