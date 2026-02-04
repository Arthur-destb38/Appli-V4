#!/usr/bin/env python3
"""Debug SMTP détaillé."""

import os
import smtplib
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv('api/.env')

def debug_smtp():
    """Debug SMTP avec plus de détails."""
    print("🔍 Debug SMTP détaillé\n")
    
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    print(f"Host: {smtp_host}")
    print(f"Port: {smtp_port}")
    print(f"User: {smtp_user}")
    print(f"Password length: {len(smtp_password) if smtp_password else 0}")
    print(f"Password starts with: {smtp_password[:4] if smtp_password else 'None'}...")
    print()
    
    try:
        print("1. Connexion au serveur SMTP...")
        server = smtplib.SMTP(smtp_host, smtp_port)
        print("✅ Connexion établie")
        
        print("2. Activation STARTTLS...")
        server.starttls()
        print("✅ STARTTLS activé")
        
        print("3. Tentative de login...")
        server.login(smtp_user, smtp_password)
        print("✅ Login réussi !")
        
        server.quit()
        print("✅ Connexion fermée proprement")
        
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ Erreur d'authentification: {e}")
        print("\n🔧 Solutions possibles:")
        print("1. Vérifiez que la 2FA est activée sur votre compte Google")
        print("2. Regénérez un nouveau mot de passe d'application")
        print("3. Vérifiez que vous copiez le mot de passe sans espaces supplémentaires")
        print("4. Essayez de vous connecter à Gmail dans un navigateur pour vérifier le compte")
        return False
        
    except smtplib.SMTPConnectError as e:
        print(f"❌ Erreur de connexion: {e}")
        print("Vérifiez votre connexion internet")
        return False
        
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return False

if __name__ == "__main__":
    debug_smtp()