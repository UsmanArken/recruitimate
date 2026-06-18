"""talent_profile_skill_breakdown

Revision ID: db4bfabf9637
Revises: 2c4118935894
Create Date: 2026-06-18 18:57:24.782132

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'db4bfabf9637'
down_revision: Union[str, None] = '2c4118935894'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('TalentProfile', sa.Column('matchedSkills', sa.JSON(), nullable=True))
    op.add_column('TalentProfile', sa.Column('missingSkills', sa.JSON(), nullable=True))
    op.add_column('TalentProfile', sa.Column('extraSkills', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('TalentProfile', 'extraSkills')
    op.drop_column('TalentProfile', 'missingSkills')
    op.drop_column('TalentProfile', 'matchedSkills')
