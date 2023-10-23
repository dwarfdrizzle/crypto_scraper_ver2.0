from app.models import BTCPrice
from app import create_app, db

# Delete oldest price records action
def prune_oldest_records():
    record_count = BTCPrice.query.count()
    print("[DEBUG] Starting the prune_oldest_records function.")
    if record_count > 8999:   #delete x number of records 
        record_count = BTCPrice.query.count()
        print("[DEBUG] About to query for record count.")
        # Delete a fixed number of the oldest records, smaller than count
        delete_count = 1500 
            
        # Find the oldest records
        oldest_records = BTCPrice.query.order_by(BTCPrice.timestamp.asc()).limit(delete_count).all()
            
        # Delete them
        for record in oldest_records:
            db.session.delete(record)
            
            # Commit the changes
            db.session.commit()
            print(f"{delete_count} oldest records deleted.")

def create_tables():
    app = create_app()
    with app.app_context():
        db.create_all()
        print("Tables created!")

if __name__ == '__main__':
    create_tables()

# Add more database-related functions as needed