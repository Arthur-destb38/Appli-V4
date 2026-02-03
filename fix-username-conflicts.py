#!/usr/bin/env python3
"""
Script pour nettoyer les conflits de noms d'utilisateur dans la base de données
"""

import sqlite3
import sys
from pathlib import Path

def fix_username_conflicts():
    # Chemin vers la base de données
    db_path = Path("api/gorillax.db")
    
    if not db_path.exists():
        print("❌ Base de données non trouvée")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔍 Recherche des conflits de noms d'utilisateur...")
        
        # Trouver tous les utilisateurs avec le nom "Arthur"
        cursor.execute("SELECT id, username, email FROM user WHERE username = 'Arthur'")
        arthur_users = cursor.fetchall()
        
        print(f"📊 Trouvé {len(arthur_users)} utilisateur(s) avec le nom 'Arthur':")
        for user in arthur_users:
            print(f"  - ID: {user[0][:8]}..., Username: {user[1]}, Email: {user[2]}")
        
        # Trouver les utilisateurs avec des noms similaires à User_402eb371
        cursor.execute("SELECT id, username, email FROM user WHERE username LIKE 'User_402eb371%'")
        temp_users = cursor.fetchall()
        
        print(f"📊 Trouvé {len(temp_users)} utilisateur(s) temporaire(s):")
        for user in temp_users:
            print(f"  - ID: {user[0][:8]}..., Username: {user[1]}, Email: {user[2]}")
        
        # Supprimer les utilisateurs temporaires (ceux créés par le système de messaging)
        if temp_users:
            print("🧹 Suppression des utilisateurs temporaires...")
            for user in temp_users:
                cursor.execute("DELETE FROM user WHERE id = ?", (user[0],))
                print(f"  ✅ Supprimé: {user[1]}")
        
        # Garder seulement le plus récent utilisateur "Arthur" (ou renommer les autres)
        if len(arthur_users) > 1:
            print("🔧 Résolution des conflits 'Arthur'...")
            # Garder le premier, renommer les autres
            for i, user in enumerate(arthur_users[1:], 1):
                new_username = f"Arthur_{i}"
                cursor.execute("UPDATE user SET username = ? WHERE id = ?", (new_username, user[0]))
                print(f"  ✅ Renommé {user[1]} -> {new_username}")
        
        conn.commit()
        print("✅ Conflits résolus avec succès!")
        
        # Afficher l'état final
        cursor.execute("SELECT id, username, email FROM user ORDER BY username")
        all_users = cursor.fetchall()
        print(f"\n📋 État final - {len(all_users)} utilisateur(s):")
        for user in all_users:
            print(f"  - {user[1]} ({user[0][:8]}...)")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    print("🦍 Gorillax - Nettoyage des conflits de noms d'utilisateur")
    print("=" * 60)
    
    success = fix_username_conflicts()
    
    if success:
        print("\n🎉 Nettoyage terminé! Tu peux maintenant redémarrer l'API.")
        sys.exit(0)
    else:
        print("\n💥 Échec du nettoyage.")
        sys.exit(1)