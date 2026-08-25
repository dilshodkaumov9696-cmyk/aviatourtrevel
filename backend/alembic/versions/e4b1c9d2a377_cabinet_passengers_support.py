"""cabinet passengers and support requests

Revision ID: e4b1c9d2a377
Revises: a1f3c9e7d224
"""
from alembic import op
import sqlalchemy as sa

revision = "e4b1c9d2a377"
down_revision = "a1f3c9e7d224"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column("orders", sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True))
    op.create_index("ix_orders_user_id", "orders", ["user_id"])
    op.create_table("profile_passengers",sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False), sa.Column("first_name", sa.String(64), nullable=False), sa.Column("last_name", sa.String(64), nullable=False), sa.Column("middle_name", sa.String(64)), sa.Column("dob", sa.Date(), nullable=False), sa.Column("citizenship", sa.String(64), nullable=False), sa.Column("doc_number", sa.String(32), nullable=False), sa.Column("doc_expiry", sa.Date()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.create_index("ix_profile_passengers_user_id", "profile_passengers", ["user_id"])
    op.create_table("support_requests", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False), sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False), sa.Column("kind", sa.String(20), nullable=False), sa.Column("status", sa.String(20), nullable=False), sa.Column("message", sa.Text(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.create_index("ix_support_requests_user_id", "support_requests", ["user_id"])
    op.create_index("ix_support_requests_order_id", "support_requests", ["order_id"])
    op.create_index("ix_support_requests_order_status", "support_requests", ["order_id", "status"])

def downgrade() -> None:
    op.drop_table("support_requests")
    op.drop_table("profile_passengers")
    op.drop_index("ix_orders_user_id", table_name="orders")
    op.drop_column("orders", "user_id")
