"""Add auth and profile columns to user table (email, password_hash, avatar_url, bio, objective)

Revision ID: 20260204_120000
Revises: 20260126_140000
Create Date: 2026-02-04 12:00:00.000000

These columns are required for login/register; the baseline migration never added them.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


revision: str = '20260204_120000'
down_revision: Union[str, None] = '20260126_140000'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Colonnes indispensables pour l'auth (login/register)
    op.add_column('user', sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('user', sa.Column('password_hash', sqlmodel.sql.sqltypes.AutoString(), nullable=True))

    # Colonnes profil (optionnelles)
    op.add_column('user', sa.Column('avatar_url', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('user', sa.Column('bio', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('user', sa.Column('objective', sqlmodel.sql.sqltypes.AutoString(), nullable=True))

    # Remplir les lignes existantes (créées avant cette migration) pour éviter NULL
    # Format password_hash = salt$hash (un hash invalide pour que login échoue)
    conn = op.get_bind()
    is_postgres = conn.dialect.name == "postgresql"
    if is_postgres:
        conn.execute(sa.text(
            """UPDATE "user" SET email = id || '@legacy.local', password_hash = 'legacy$no_login'
               WHERE email IS NULL"""
        ))
    else:
        conn.execute(sa.text(
            "UPDATE user SET email = id || '@legacy.local', password_hash = 'legacy$no_login' WHERE email IS NULL"
        ))

    # Rendre email non nullable et unique (après remplissage)
    op.alter_column(
        'user',
        'email',
        existing_type=sqlmodel.sql.sqltypes.AutoString(),
        nullable=False,
    )
    op.alter_column(
        'user',
        'password_hash',
        existing_type=sqlmodel.sql.sqltypes.AutoString(),
        nullable=False,
    )
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_email'), table_name='user')
    op.drop_column('user', 'objective')
    op.drop_column('user', 'bio')
    op.drop_column('user', 'avatar_url')
    op.drop_column('user', 'password_hash')
    op.drop_column('user', 'email')
