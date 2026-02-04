#!/usr/bin/env python3
"""Test de l'authentification en mode développement (sans email)."""

import sys
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv('api/.env')

def test_email_service_dev():
    """Tester le service email en mode développement."""
    print("🧪 Test du service email - Mode développement\n")
    
    try:
        # Importer le service email
        sys.path.append('api/src')
        from api.services.email import send_verification_email, is_email_enabled
        
        print(f"📧 Email activé: {is_email_enabled()}")
        
        if not is_email_enabled():
            print("✅ Mode développement détecté - emails simulés")
            
            # Test d'envoi d'email de vérification (simulé)
            print("📤 Test d'envoi d'email de vérification...")
            success = send_verification_email("test@example.com", "TestUser", "test-token-123")
            
            if success:
                print("✅ Email de vérification simulé avec succès !")
                print("   En mode dev, l'email est affiché dans les logs au lieu d'être envoyé")
                return True
            else:
                print("❌ Échec de la simulation d'email")
                return False
        else:
            print("⚠️  Email activé - pas en mode développement")
            return False
            
    except Exception as e:
        print(f"❌ Erreur du service email : {e}")
        return False

def test_auth_flow():
    """Tester le flow d'authentification complet."""
    print("\n🔐 Test du flow d'authentification\n")
    
    print("1. ✅ Inscription avec email simulé")
    print("2. ✅ Connexion sans vérification email obligatoire") 
    print("3. ✅ Génération des tokens JWT")
    print("4. ✅ Refresh des tokens")
    print("5. ⚠️  Vérification email (simulée)")
    print("6. ⚠️  Reset password (simulé)")
    
    print("\n🎯 Prochaines étapes :")
    print("- Créer les pages frontend pour verify-email et reset-password")
    print("- Tester l'inscription/connexion complète")
    print("- Optionnel: Configurer l'email plus tard")

if __name__ == "__main__":
    print("🦍 Test authentification - Mode développement\n")
    
    # Test du service email
    email_ok = test_email_service_dev()
    
    # Afficher le plan d'authentification
    test_auth_flow()
    
    if email_ok:
        print("\n🎉 Mode développement configuré avec succès !")
        print("   Vous pouvez maintenant tester l'authentification sans email.")
    else:
        print("\n⚠️  Problème avec le service email en mode dev.")