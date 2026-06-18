"""interview_livekit_fields

Revision ID: dd86116921c4
Revises: a1b2c3d4e5f6
Create Date: 2026-06-18 22:47:30.689608

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'dd86116921c4'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE interviewstatus ADD VALUE IF NOT EXISTS 'IN_PROGRESS'")
    op.execute("ALTER TYPE interviewstatus ADD VALUE IF NOT EXISTS 'COMPLETED'")
    op.add_column('Interview', sa.Column('livekitRoomName', sa.String(), nullable=True))
    op.add_column('Interview', sa.Column('candidateJoinUrl', sa.String(), nullable=True))
    op.add_column('Interview', sa.Column('audioUrl', sa.String(), nullable=True))
    op.add_column('Interview', sa.Column('agentStatus', sa.String(), nullable=True, server_default='pending'))


def downgrade() -> None:
    op.drop_column('Interview', 'agentStatus')
    op.drop_column('Interview', 'audioUrl')
    op.drop_column('Interview', 'candidateJoinUrl')
    op.drop_column('Interview', 'livekitRoomName')
