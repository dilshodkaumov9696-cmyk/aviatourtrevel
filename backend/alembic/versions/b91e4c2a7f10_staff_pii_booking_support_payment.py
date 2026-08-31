"""staff, wider doc numbers, booking_url, support reply, payment_id

Revision ID: b91e4c2a7f10
Revises: 4e8d7e552cc7
"""
from alembic import op
import sqlalchemy as sa

revision = "b91e4c2a7f10"
down_revision = "4e8d7e552cc7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("is_staff", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.alter_column("passengers", "doc_number", existing_type=sa.String(32), type_=sa.String(255))
    op.alter_column(
        "profile_passengers", "doc_number", existing_type=sa.String(32), type_=sa.String(255)
    )
    op.add_column("orders", sa.Column("booking_url", sa.String(1024), nullable=True))
    op.add_column("orders", sa.Column("payment_id", sa.String(64), nullable=True))
    op.add_column("support_requests", sa.Column("operator_reply", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("support_requests", "operator_reply")
    op.drop_column("orders", "payment_id")
    op.drop_column("orders", "booking_url")
    op.alter_column(
        "profile_passengers", "doc_number", existing_type=sa.String(255), type_=sa.String(32)
    )
    op.alter_column("passengers", "doc_number", existing_type=sa.String(255), type_=sa.String(32))
    op.drop_column("users", "is_staff")
