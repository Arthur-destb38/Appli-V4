"""Routes d'administration."""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..db import get_session
from ..models import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
def list_users(
    limit: int = 50,
    session: Session = Depends(get_session)
):
    """Liste tous les utilisateurs (pour debug)."""
    users = session.exec(
        select(User)
        .order_by(User.created_at.desc())
        .limit(limit)
    ).all()
    
    return {
        "count": len(users),
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "bio": u.bio,
                "objective": u.objective,
                "created_at": u.created_at,
                "email_verified": u.email_verified,
            }
            for u in users
        ]
    }


@router.post("/create-demo-users")
def create_demo_users(session: Session = Depends(get_session)):
    """Créer les utilisateurs de démo (pour setup initial)."""
    from ..utils.auth import hash_password
    from datetime import datetime, timezone
    from ..models import Workout
    
    try:
        # Vérifier si demo existe déjà
        existing_demo = session.exec(select(User).where(User.username == "demo")).first()
        if existing_demo:
            return {"message": "Demo users already exist"}
        
        # Créer demo
        demo = User(
            id='demo-permanent',
            username='demo',
            email='demo@gorillax.app',
            password_hash=hash_password('DemoPassword123'),
            created_at=datetime.now(timezone.utc),
            email_verified=True,
            profile_completed=True
        )
        session.add(demo)
        
        # Créer arthur
        arthur = User(
            id='test-user-002',
            username='arthur',
            email='arthur@gorillax.app',
            password_hash=hash_password('Test123456'),
            created_at=datetime.now(timezone.utc),
            email_verified=True,
            profile_completed=True
        )
        session.add(arthur)
        
        session.commit()
        
        # Créer des workouts
        demo_w1 = Workout(
            user_id='demo-permanent',
            title='Séance Demo Cloud 1',
            status='completed',
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(demo_w1)
        
        demo_w2 = Workout(
            user_id='demo-permanent',
            title='Séance Demo Cloud 2',
            status='draft',
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(demo_w2)
        
        arthur_w1 = Workout(
            user_id='test-user-002',
            title='Séance Arthur Cloud 1',
            status='completed',
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(arthur_w1)
        
        arthur_w2 = Workout(
            user_id='test-user-002',
            title='Séance Arthur Cloud 2',
            status='draft',
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(arthur_w2)
        
        session.commit()
        
        return {
            "message": "Demo users created successfully",
            "users": ["demo", "arthur"],
            "credentials": {
                "demo": "demo / DemoPassword123",
                "arthur": "arthur / Test123456"
            }
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/debug/schema")
def debug_schema(session: Session = Depends(get_session)):
    """Debug endpoint to check database schema."""
    from sqlalchemy import text
    from ..db import _database_url
    from sqlalchemy.engine.url import make_url
    
    try:
        url = _database_url()
        parsed_url = make_url(url)
        is_postgres = parsed_url.get_backend_name() == "postgresql"
        
        if is_postgres:
            # Check user table columns
            result = session.exec(text(
                "SELECT column_name, data_type FROM information_schema.columns "
                "WHERE table_name='user' ORDER BY ordinal_position"
            ))
            columns = [{"name": row[0], "type": row[1]} for row in result]
            
            # Check if demo user exists
            demo_user = session.exec(select(User).where(User.username == "demo")).first()
            
            return {
                "database": "postgresql",
                "user_table_columns": columns,
                "demo_user_exists": demo_user is not None,
                "demo_user_id": demo_user.id if demo_user else None
            }
        else:
            return {"database": "sqlite", "message": "Schema check only works on PostgreSQL"}
    except Exception as e:
        return {"error": str(e)}



@router.post("/debug/test-login")
def debug_test_login(session: Session = Depends(get_session)):
    """Debug endpoint to test login logic."""
    from ..utils.auth import verify_password
    from datetime import datetime, timezone
    
    try:
        # Get demo user
        demo_user = session.exec(select(User).where(User.username == "demo")).first()
        
        if not demo_user:
            return {"error": "Demo user not found"}
        
        # Test password verification
        password_correct = verify_password("DemoPassword123", demo_user.password_hash)
        
        return {
            "user_found": True,
            "username": demo_user.username,
            "email": demo_user.email,
            "password_hash_length": len(demo_user.password_hash),
            "password_correct": password_correct,
            "email_verified": demo_user.email_verified,
            "created_at": demo_user.created_at.isoformat() if demo_user.created_at else None
        }
    except Exception as e:
        return {"error": str(e), "type": type(e).__name__}



@router.post("/debug/full-login-test")
def debug_full_login_test(session: Session = Depends(get_session)):
    """Debug endpoint to test full login flow."""
    from ..utils.auth import verify_password, create_access_token, create_refresh_token
    from ..models import RefreshToken
    from datetime import datetime, timezone
    
    try:
        # Step 1: Get user
        demo_user = session.exec(select(User).where(User.username == "demo")).first()
        if not demo_user:
            return {"step": "get_user", "error": "User not found"}
        
        # Step 2: Verify password
        password_ok = verify_password("DemoPassword123", demo_user.password_hash)
        if not password_ok:
            return {"step": "verify_password", "error": "Password incorrect"}
        
        # Step 3: Create access token
        try:
            access_token = create_access_token(demo_user.id)
        except Exception as e:
            return {"step": "create_access_token", "error": str(e), "type": type(e).__name__}
        
        # Step 4: Create refresh token
        try:
            refresh_token, exp = create_refresh_token(demo_user.id)
        except Exception as e:
            return {"step": "create_refresh_token", "error": str(e), "type": type(e).__name__}
        
        # Step 5: Save refresh token
        try:
            rt = RefreshToken(token=refresh_token, user_id=demo_user.id, expires_at=exp)
            session.add(rt)
            session.commit()
        except Exception as e:
            session.rollback()
            return {"step": "save_refresh_token", "error": str(e), "type": type(e).__name__}
        
        return {
            "success": True,
            "access_token_length": len(access_token),
            "refresh_token_length": len(refresh_token),
            "expires_at": exp.isoformat()
        }
    except Exception as e:
        return {"step": "unknown", "error": str(e), "type": type(e).__name__}
