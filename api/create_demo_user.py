"""Script pour créer le compte demo."""
import sys
sys.path.insert(0, 'src')

from sqlmodel import Session, select
from api.db import get_engine
from api.models import User
from api.utils.auth import hash_password

engine = get_engine()
with Session(engine) as session:
    # Vérifier si demo existe
    demo = session.exec(select(User).where(User.username == 'demo')).first()
    if demo:
        # Mettre à jour le mot de passe
        demo.password_hash = hash_password('DemoPassword123')
        demo.email_verified = True
        session.add(demo)
        session.commit()
        print('✅ Compte demo mis à jour!')
        print('   Username: demo')
        print('   Password: DemoPassword123')
        print('   Email:', demo.email)
    else:
        # Créer le compte demo
        demo_user = User(
            id='demo',
            username='demo',
            email='demo@gorillax.local',
            password_hash=hash_password('DemoPassword123'),
            consent_to_public_share=True,
            bio='Compte de démonstration 🦍',
            objective='Découvrir Gorillax',
            email_verified=True
        )
        session.add(demo_user)
        session.commit()
        print('✅ Compte demo créé avec succès!')
        print('   Username: demo')
        print('   Password: DemoPassword123')
        print('   Email: demo@gorillax.local')
