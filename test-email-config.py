#!/usr/bin/env python3
"""Test de la configuration email SMTP."""

import os
import sys
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv('api/.env')

def test_email_config():
    """Tester la configuration email."""
    print("🧪 Test de la configuration email SMTP\n")
    
    # Vérifier les variables d'environnement
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("FROM_EMAIL")
    
    print("📋 Configuration détectée :")
    print(f"   SMTP_HOST: {smtp_host}")
    print(f"   SMTP_PORT: {smtp_port}")
    print(f"   SMTP_USER: {smtp_user}")
    print(f"   SMTP_PASSWORD: {'*' * len(smtp_password) if smtp_password else 'NON DÉFINI'}")
    print(f"   FROM_EMAIL: {from_email}")
    print()
    
    # Vérifier que tout est configuré
    if not all([smtp_host, smtp_port, smtp_user, smtp_password]):
        print("❌ Configuration incomplète !")
        print("   Vérifiez que SMTP_USER et SMTP_PASSWORD sont définis dans api/.env")
        return False
    
    # Test de connexion SMTP
    print("🔗 Test de connexion SMTP...")
    try:
        import smtplib
        from email.mime.text import MIMEText
        
        # Connexion au serveur SMTP
        with smtplib.SMTP(smtp_host, int(smtp_port)) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            print("✅ Connexion SMTP réussie !")
            
            # Test d'envoi d'email (à soi-même)
            print(f"📧 Envoi d'un email de test à {smtp_user}...")
            
            msg = MIMEText("Test de configuration SMTP pour Gorillax API 🦍")
            msg["Subject"] = "Test SMTP - Gorillax"
            msg["From"] = from_email
            msg["To"] = smtp_user
            
            server.send_message(msg)
            print("✅ Email de test envoyé avec succès !")
            print(f"   Vérifiez votre boîte mail : {smtp_user}")
            
        return True
        
    except smtplib.SMTPAuthenticationError:
        print("❌ Erreur d'authentification SMTP")
        print("   Vérifiez votre mot de passe d'application Gmail")
        print("   Assurez-vous que la 2FA est activée sur votre compte Google")
        return False
        
    except Exception as e:
        print(f"❌ Erreur de connexion SMTP : {e}")
        return False

def test_email_service():
    """Tester le service email de l'API."""
    print("\n🔧 Test du service email de l'API...")
    
    try:
        # Importer le service email
        sys.path.append('api/src')
        from api.services.email import send_verification_email, is_email_enabled
        
        if not is_email_enabled():
            print("❌ Service email désactivé")
            return False
            
        print("✅ Service email activé")
        
        # Test d'envoi d'email de vérification
        test_email = os.getenv("SMTP_USER")
        success = send_verification_email(test_email, "TestUser", "test-token-123")
        
        if success:
            print("✅ Email de vérification envoyé avec succès !")
            print(f"   Vérifiez votre boîte mail : {test_email}")
            return True
        else:
            print("❌ Échec de l'envoi de l'email de vérification")
            return False
            
    except Exception as e:
        print(f"❌ Erreur du service email : {e}")
        return False

if __name__ == "__main__":
    print("🦍 Test de configuration email - Gorillax API\n")
    
    # Test 1 : Configuration SMTP
    smtp_ok = test_email_config()
    
    if smtp_ok:
        # Test 2 : Service email de l'API
        service_ok = test_email_service()
        
        if service_ok:
            print("\n🎉 Configuration email complète et fonctionnelle !")
            print("   Vous pouvez maintenant tester l'inscription avec vérification email.")
        else:
            print("\n⚠️  SMTP fonctionne mais le service API a des problèmes.")
    else:
        print("\n❌ Configuration SMTP à corriger avant de continuer.")
        print("\n📋 Instructions :")
        print("1. Activez la 2FA sur votre compte Google")
        print("2. Générez un mot de passe d'application")
        print("3. Mettez à jour SMTP_USER et SMTP_PASSWORD dans api/.env")
        print("4. Relancez ce test")