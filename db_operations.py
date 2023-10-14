from app.models import BTCPrice
from app import create_app, db

app = create_app()

# Delete oldest price records action
def prune_oldest_records():
    print("[DEBUG] Starting the prune_oldest_records function.")
    with app.app_context():
        record_count = BTCPrice.query.count()
        print("[DEBUG] About to query for record count.")
        if record_count > 500000:
            # Delete a fixed number of the oldest records
            delete_count = 20000 
            
            # Find the oldest records
            oldest_records = BTCPrice.query.order_by(BTCPrice.timestamp.asc()).limit(delete_count).all()
            
            # Delete them
            for record in oldest_records:
                db.session.delete(record)
            
            # Commit the changes
            db.session.commit()
            print(f"{delete_count} oldest records deleted.")

def create_tables():
    with app.app_context():
        db.create_all()
        print("Tables created!")

if __name__ == '__main__':
    create_tables()

# Add more database-related functions as needed

