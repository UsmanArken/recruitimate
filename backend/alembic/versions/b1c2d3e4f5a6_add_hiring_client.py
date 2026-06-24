"""add_hiring_client_job_post_document_candidate_marking

Revision ID: b1c2d3e4f5a6
Revises: a3f9e1b2c4d5
Create Date: 2026-06-24 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'b1c2d3e4f5a6'
down_revision: Union[str, None] = 'a3f9e1b2c4d5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create HiringClient table
    op.create_table(
        'HiringClient',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('organizationId', sa.String(), sa.ForeignKey('Organization.id'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('website', sa.String(), nullable=True),
        sa.Column('companyProfile', sa.Text(), nullable=True),
        sa.Column('impressionNotes', sa.Text(), nullable=True),
        sa.Column('webDataConsentAt', sa.DateTime(), nullable=True),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organizationId', 'slug', name='uq_hiringclient_org_slug'),
    )

    # Add hiringClientId and jobPostDocument to Job
    op.add_column('Job', sa.Column('hiringClientId', sa.String(), sa.ForeignKey('HiringClient.id'), nullable=True))
    op.add_column('Job', sa.Column('jobPostDocument', sa.Text(), nullable=True))

    # Add marking to Candidate
    op.add_column('Candidate', sa.Column('marking', sa.String(), nullable=False, server_default='ACTIVE'))


def downgrade() -> None:
    op.drop_column('Candidate', 'marking')
    op.drop_column('Job', 'jobPostDocument')
    op.drop_column('Job', 'hiringClientId')
    op.drop_table('HiringClient')
