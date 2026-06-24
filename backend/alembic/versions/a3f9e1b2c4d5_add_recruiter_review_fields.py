"""add_recruiter_review_fields

Revision ID: a3f9e1b2c4d5
Revises: 765bf2272b9d
Create Date: 2026-06-24 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'a3f9e1b2c4d5'
down_revision: Union[str, None] = '765bf2272b9d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('JobApplication', sa.Column('talentReviewVerdict', sa.String(), nullable=False, server_default='PENDING'))
    op.add_column('JobApplication', sa.Column('talentReviewNotes', sa.Text(), nullable=True))
    op.add_column('JobApplication', sa.Column('talentReviewedAt', sa.DateTime(), nullable=True))
    op.add_column('JobApplication', sa.Column('talentReviewedById', sa.String(), sa.ForeignKey('User.id'), nullable=True))
    op.add_column('JobApplication', sa.Column('hireReviewVerdict', sa.String(), nullable=False, server_default='PENDING'))
    op.add_column('JobApplication', sa.Column('hireReviewNotes', sa.Text(), nullable=True))
    op.add_column('JobApplication', sa.Column('hireReviewedAt', sa.DateTime(), nullable=True))
    op.add_column('JobApplication', sa.Column('hireReviewedById', sa.String(), sa.ForeignKey('User.id'), nullable=True))


def downgrade() -> None:
    op.drop_column('JobApplication', 'hireReviewedById')
    op.drop_column('JobApplication', 'hireReviewedAt')
    op.drop_column('JobApplication', 'hireReviewNotes')
    op.drop_column('JobApplication', 'hireReviewVerdict')
    op.drop_column('JobApplication', 'talentReviewedById')
    op.drop_column('JobApplication', 'talentReviewedAt')
    op.drop_column('JobApplication', 'talentReviewNotes')
    op.drop_column('JobApplication', 'talentReviewVerdict')
