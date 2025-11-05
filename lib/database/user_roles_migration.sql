-- =====================================================
-- МИГРАЦИЯ: Множественные роли для пользователей
-- Kamchatour Hub - User Roles Migration
-- =====================================================

-- Шаг 1: Добавляем новое поле roles (массив)
ALTER TABLE users ADD COLUMN IF NOT EXISTS roles JSONB DEFAULT '["tourist"]';

-- Шаг 2: Мигрируем данные из старого поля role в новое roles
UPDATE users 
SET roles = jsonb_build_array(role::text)
WHERE roles IS NULL OR roles = '["tourist"]';

-- Шаг 3: Удаляем старый CHECK constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Шаг 4: Делаем старое поле role nullable (для обратной совместимости)
ALTER TABLE users ALTER COLUMN role DROP NOT NULL;

-- Шаг 5: Создаем функцию для валидации ролей
CREATE OR REPLACE FUNCTION validate_user_roles(roles_array JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    role_item TEXT;
    valid_roles TEXT[] := ARRAY['tourist', 'operator', 'guide', 'provider', 'driver', 'hotel_manager', 'restaurant_owner'];
BEGIN
    -- Проверяем, что roles - это массив
    IF jsonb_typeof(roles_array) != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Проверяем, что массив не пустой
    IF jsonb_array_length(roles_array) = 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Проверяем каждую роль
    FOR role_item IN SELECT jsonb_array_elements_text(roles_array)
    LOOP
        IF role_item != ALL(valid_roles) THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Шаг 6: Добавляем CHECK constraint для нового поля
ALTER TABLE users 
ADD CONSTRAINT users_roles_valid 
CHECK (validate_user_roles(roles));

-- Шаг 7: Создаем индекс для быстрого поиска по ролям (GIN index для JSONB)
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN (roles);

-- Шаг 8: Создаем функцию для проверки наличия роли у пользователя
CREATE OR REPLACE FUNCTION user_has_role(user_roles JSONB, check_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN user_roles ? check_role;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Шаг 9: Создаем view для обратной совместимости (primary_role - первая роль)
CREATE OR REPLACE VIEW users_with_primary_role AS
SELECT 
    id,
    email,
    name,
    roles,
    roles->>0 as primary_role,
    preferences,
    created_at,
    updated_at
FROM users;

-- Комментарии
COMMENT ON COLUMN users.roles IS 'Массив ролей пользователя (может быть несколько). Примеры: ["tourist"], ["operator", "guide"], ["provider", "hotel_manager"]';
COMMENT ON FUNCTION validate_user_roles IS 'Валидирует массив ролей - проверяет, что это непустой массив допустимых значений';
COMMENT ON FUNCTION user_has_role IS 'Проверяет, есть ли у пользователя указанная роль';

-- Примеры использования:

-- Найти всех туристов:
-- SELECT * FROM users WHERE roles @> '["tourist"]';

-- Найти всех операторов:
-- SELECT * FROM users WHERE roles @> '["operator"]';

-- Найти пользователей с несколькими ролями:
-- SELECT * FROM users WHERE jsonb_array_length(roles) > 1;

-- Проверить, есть ли у пользователя роль 'guide':
-- SELECT user_has_role(roles, 'guide') FROM users WHERE id = 'some-uuid';

-- Добавить роль пользователю:
-- UPDATE users 
-- SET roles = roles || '["guide"]'::jsonb
-- WHERE id = 'some-uuid' AND NOT roles @> '["guide"]';

-- Удалить роль у пользователя:
-- UPDATE users 
-- SET roles = (
--     SELECT jsonb_agg(role)
--     FROM jsonb_array_elements_text(roles) role
--     WHERE role != 'guide'
-- )
-- WHERE id = 'some-uuid';
