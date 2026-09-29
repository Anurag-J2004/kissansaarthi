import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Simulated block-level training dataset
def generate_training_data():
    np.random.seed(42)
    # 1000 simulated weather observations mapping block to panchayat
    block_temps = np.random.normal(30, 2, 1000)
    elevations = np.random.normal(500, 50, 1000)
    ndvi_scores = np.random.uniform(0.2, 0.8, 1000)
    
    # Target: Panchayat temperature (inferred logically: higher elevation = cooler, high ndvi = slightly cooler)
    panchayat_temps = block_temps - ((elevations - 500) * 0.006) - (ndvi_scores * 0.5)
    
    df = pd.DataFrame({
        'block_temp': block_temps,
        'elevation_m': elevations,
        'ndvi': ndvi_scores,
        'target_panchayat_temp': panchayat_temps
    })
    
    return df

def train_and_save_model():
    print("Generating training data...")
    df = generate_training_data()
    
    X = df[['block_temp', 'elevation_m', 'ndvi']]
    y = df['target_panchayat_temp']
    
    print("Training RandomForestRegressor Pipeline...")
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('regressor', RandomForestRegressor(n_estimators=50, random_state=42))
    ])
    
    pipeline.fit(X, y)
    
    score = pipeline.score(X, y)
    print(f"Model trained successfully. R^2 Score: {score:.4f}")
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'model.pkl')
    
    joblib.dump(pipeline, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_and_save_model()
