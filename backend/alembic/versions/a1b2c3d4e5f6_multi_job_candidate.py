"""multi_job_candidate

Revision ID: a1b2c3d4e5f6
Revises: db4bfabf9637
Create Date: 2026-06-18 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'db4bfabf9637'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('DROP INDEX IF EXISTS candidate_portal_email_unique')
    # Drop the FK constraint on jobId — name is auto-generated, find and drop it
    op.execute("""
        DO $$
        DECLARE
            r RECORD;
        BEGIN
            FOR r IN
                SELECT conname FROM pg_constraint
                WHERE conrelid = '"Candidate"'::regclass
                  AND contype = 'f'
                  AND conname LIKE '%jobid%'
            LOOP
                EXECUTE 'ALTER TABLE "Candidate" DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
            END LOOP;
        END$$;
    """)
    op.drop_column('Candidate', 'jobId')
    op.drop_column('Candidate', 'status')
    op.execute(
        'CREATE UNIQUE INDEX candidate_email_org_unique '
        'ON "Candidate" ("organizationId", email) '
        'WHERE email IS NOT NULL'
    )


def downgrade() -> None:
    op.execute('DROP INDEX IF EXISTS candidate_email_org_unique')
    op.add_column('Candidate', sa.Column('status', sa.String(), nullable=False, server_default='applied'))
    op.add_column('Candidate', sa.Column('jobId', sa.String(), nullable=True))
    op.create_foreign_key('candidate_job_id_fkey', 'Candidate', 'Job', ['jobId'], ['id'])
    op.execute(
        'CREATE UNIQUE INDEX candidate_portal_email_unique '
        'ON "Candidate" (email) WHERE "passwordHash" IS NOT NULL'
    )
