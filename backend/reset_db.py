import database, models
from sqlalchemy import text

engine = database.engine
connection = engine.connect()
transaction = connection.begin()
try:
    # Drop all tables safely
    print("Dropping existing tables...")
    # SQLITE doesn't support DROP TABLE ... CASCADE, so we just drop known ones
    tables = ['emergency_requests', 'ambulances', 'hospital_resources', 'hospitals', 'patients', 'patient_reports', 'users', 'chatbot_history']
    for table in tables:
        try:
            connection.execute(text(f"DROP TABLE IF EXISTS {table}"))
            print(f"Dropped {table}")
        except:
            pass
    
    transaction.commit()
    print("Re-creating tables...")
    models.Base.metadata.create_all(bind=engine)
    print("Initialization complete. Run your app to re-seed.")
except Exception as e:
    transaction.rollback()
    print(f"Failed: {e}")
finally:
    connection.close()
