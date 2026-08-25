"""email verification + passenger gender

Revision ID: 4e8d7e552cc7
Revises: e4b1c9d2a377
"""
from alembic import op
import sqlalchemy as sa

revision = "4e8d7e552cc7"
down_revision = "e4b1c9d2a377"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.false()))
    # Google уже подтвердил владение почтой при OAuth-входе — таким аккаунтам
    # не нужно повторное подтверждение письмом.
    op.execute("UPDATE users SET email_verified = true WHERE google_id IS NOT NULL")
    op.add_column("profile_passengers", sa.Column("gender", sa.String(8), nullable=True))


def downgrade() -> None:
    op.drop_column("profile_passengers", "gender")
    op.drop_column("users", "email_verified")
