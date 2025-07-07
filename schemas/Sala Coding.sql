-- ===========================================
-- FUNÇÃO PARA GERAR CÓDIGO DE SALA
-- ===========================================

-- Função para gerar código único de sala
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    code TEXT := '';
    i INTEGER := 0;
BEGIN
    -- Gerar código de 6 caracteres
    FOR i IN 1..6 LOOP
        code := code || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    
    -- Verificar se o código já existe
    WHILE EXISTS (SELECT 1 FROM rooms WHERE codigo_sala = code) LOOP
        code := '';
        FOR i IN 1..6 LOOP
            code := code || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
        END LOOP;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;