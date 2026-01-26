#!/usr/bin/env python3
"""
Script pour créer des utilisateurs de test dans Gorillax
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'api', 'src'))

from api.db import get_session
from api.models import User
from api.utils.auth import hash_password
from sqlmodel import Session, select

def create_test_users():
    """Créer des utilisateurs de test"""
    
    # Utilisateurs de test
    test_users = [
        {
            "username": "testuser",
            "email": "testuser@example.com", 
            "password": "TestPassword123",
            "profile_completed": False
        },
        {
            "username": "testcomplete",
            "email": "testcomplete@example.com",
            "password": "TestComplete123", 
            "profile_completed": True,
            "bio": "Utilisateur de test avec profil complet",
            "objective": "muscle_gain",
            "experience_level": "intermediate",
            "training_frequency": 4
        },
        {
            "username": "demo",
            "email": "demo@gorillax.com",
            "password": "DemoPassword123",
            "profile_completed": True,
            "bio": "Compte de démonstration",
            "objective": "general_fitness", 
            "experience_level": "beginner",
            "training_frequency": 3
        }
    ]
    
    session = next(get_session())
    
    for user_data in test_users:
        # Vérifier si l'utilisateur existe déjà
        existing = session.exec(select(User).where(User.username == user_data["username"])).first()
        
        if existing:
            print(f"✅ Utilisateur {user_data['username']} existe déjà")
            continue
            
        # Créer l'utilisateur
        user = User(
            id=user_data["username"],
            username=user_data["username"],
            email=user_data["email"],
            password_hash=hash_password(user_data["password"]),
            email_verified=True,  # Pré-vérifié pour les tests
            profile_completed=user_data.get("profile_completed", False),
            bio=user_data.get("bio"),
            objective=user_data.get("objective"),
            experience_level=user_data.get("experience_level"),
            training_frequency=user_data.get("training_frequency"),
            consent_to_public_share=True
        )
        
        session.add(user)
        print(f"✅ Utilisateur {user_data['username']} créé")
    
    session.commit()
    session.close()
    
    print("\n🦍 Utilisateurs de test créés !")
    print("\nComptes disponibles :")
    print("1. testuser / TestPassword123 (profil incomplet)")
    print("2. testcomplete / TestComplete123 (profil complet)")  
    print("3. demo / DemoPassword123 (profil complet)")

if __name__ == "__main__":
    create_test_users()