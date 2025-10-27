DO $$
BEGIN
    -- Ajouter la colonne status si absente
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'entrepreneurs'
          AND column_name = 'status'
    ) THEN
        ALTER TABLE public.entrepreneurs
            ADD COLUMN status VARCHAR(20) DEFAULT 'draft'
            CHECK (status IN ('draft', 'published', 'deactivated'));
    END IF;

    -- Ajouter la colonne first_saved_at si absente
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'entrepreneurs'
          AND column_name = 'first_saved_at'
    ) THEN
        ALTER TABLE public.entrepreneurs
            ADD COLUMN first_saved_at TIMESTAMPTZ;
    END IF;
END $$;

-- Définir les valeurs par défaut
ALTER TABLE public.entrepreneurs
    ALTER COLUMN status SET DEFAULT 'draft',
    ALTER COLUMN first_saved_at SET DEFAULT NOW();

-- Mettre à jour les enregistrements existants
UPDATE public.entrepreneurs
SET status = 'published'
WHERE status IS NULL;

UPDATE public.entrepreneurs
SET first_saved_at = COALESCE(first_saved_at, created_at);

-- Créer l'index statut
CREATE INDEX IF NOT EXISTS idx_entrepreneurs_status
    ON public.entrepreneurs(status);

-- Trigger pour verrouiller les champs sensibles
CREATE OR REPLACE FUNCTION public.lock_sensitive_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.first_saved_at IS NOT NULL THEN
        NEW.first_name := OLD.first_name;
        NEW.last_name := OLD.last_name;
        NEW.company_name := OLD.company_name;
        NEW.email := OLD.email;
        NEW.phone := OLD.phone;
    ELSE
        NEW.first_saved_at := COALESCE(NEW.first_saved_at, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lock_entrepreneur_fields ON public.entrepreneurs;
CREATE TRIGGER lock_entrepreneur_fields
    BEFORE UPDATE ON public.entrepreneurs
    FOR EACH ROW
    EXECUTE FUNCTION public.lock_sensitive_fields();
