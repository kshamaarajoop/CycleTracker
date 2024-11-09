# app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import statistics

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cycle_tracking.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class CycleEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False)  # External user ID from main app
    date = db.Column(db.Date, nullable=False)
    flow_intensity = db.Column(db.String(20))
    symptoms = db.Column(db.JSON)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat(),
            'flow_intensity': self.flow_intensity,
            'symptoms': self.symptoms,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Routes
@app.route('/api/cycles/<user_id>', methods=['GET'])
def get_cycles(user_id):
    """Get all cycle entries for a user"""
    entries = CycleEntry.query.filter_by(user_id=user_id).order_by(CycleEntry.date).all()
    return jsonify([entry.to_dict() for entry in entries])

@app.route('/api/cycles/<user_id>', methods=['POST'])
def add_cycle(user_id):
    """Add a new cycle entry"""
    data = request.get_json()
    
    if not data or not data.get('date'):
        return jsonify({'error': 'Date is required'}), 400
        
    try:
        date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    # Check for duplicate entry
    existing_entry = CycleEntry.query.filter_by(
        user_id=user_id,
        date=date
    ).first()
    
    if existing_entry:
        return jsonify({'error': 'Entry already exists for this date'}), 409
        
    entry = CycleEntry(
        user_id=user_id,
        date=date,
        flow_intensity=data.get('flow_intensity'),
        symptoms=data.get('symptoms', {}),
        notes=data.get('notes')
    )
    
    db.session.add(entry)
    db.session.commit()
    
    return jsonify(entry.to_dict()), 201

@app.route('/api/cycles/<user_id>/<int:entry_id>', methods=['PUT'])
def update_cycle(user_id, entry_id):
    """Update an existing cycle entry"""
    entry = CycleEntry.query.filter_by(id=entry_id, user_id=user_id).first()
    
    if not entry:
        return jsonify({'error': 'Entry not found'}), 404
        
    data = request.get_json()
    
    if data.get('date'):
        try:
            entry.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
            
    if 'flow_intensity' in data:
        entry.flow_intensity = data['flow_intensity']
    if 'symptoms' in data:
        entry.symptoms = data['symptoms']
    if 'notes' in data:
        entry.notes = data['notes']
        
    db.session.commit()
    return jsonify(entry.to_dict())

@app.route('/api/cycles/<user_id>/<int:entry_id>', methods=['DELETE'])
def delete_cycle(user_id, entry_id):
    """Delete a cycle entry"""
    entry = CycleEntry.query.filter_by(id=entry_id, user_id=user_id).first()
    
    if not entry:
        return jsonify({'error': 'Entry not found'}), 404
        
    db.session.delete(entry)
    db.session.commit()
    
    return jsonify({'message': 'Entry deleted successfully'})

@app.route('/api/cycles/<user_id>/predictions', methods=['GET'])
def get_predictions(user_id):
    """Get cycle predictions based on previous entries"""
    entries = CycleEntry.query.filter_by(user_id=user_id).order_by(CycleEntry.date).all()
    
    if len(entries) < 2:
        return jsonify([])
        
    # Calculate average cycle length
    cycle_lengths = []
    for i in range(1, len(entries)):
        days = (entries[i].date - entries[i-1].date).days
        if days > 0:  # Ensure valid cycle length
            cycle_lengths.append(days)
            
    if not cycle_lengths:
        return jsonify([])
        
    avg_cycle_length = round(statistics.mean(cycle_lengths))
    
    # Predict next 3 cycles
    predictions = []
    last_date = entries[-1].date
    
    for i in range(1, 4):
        predicted_date = last_date + timedelta(days=avg_cycle_length * i)
        predictions.append({
            'date': predicted_date.isoformat(),
            'predicted_cycle_length': avg_cycle_length
        })
        
    return jsonify(predictions)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)