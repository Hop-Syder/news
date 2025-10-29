from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict


class MessageResponse(BaseModel):
    """Structure générique pour les messages simples."""

    model_config = ConfigDict(extra="ignore")

    message: str


class TokenRefreshResponse(BaseModel):
    """Réponse normalisée pour les rafraîchissements de jeton."""

    model_config = ConfigDict(extra="ignore")

    access_token: str
    token_type: str = "bearer"
    expires_at: Optional[str] = None


class LogoUploadResponse(MessageResponse):
    """Réponse pour le téléversement de logos."""

    url: str
    filename: str


class LogoDeleteResponse(MessageResponse):
    """Réponse lors de la suppression d'un logo."""

    filename: str


class PlatformStatsResponse(BaseModel):
    """Résumé global des statistiques de la plateforme."""

    model_config = ConfigDict(extra="ignore")

    total_users: int
    total_entrepreneurs: int
    countries_covered: int
