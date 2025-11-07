"""
Test script to debug generate-project-interview endpoint
Run: python test_project_interview.py
"""

import requests
import json

FASTAPI_URL = "http://localhost:8000"
TEST_REPO = "https://github.com/ROHAN2027/Jadoo-Tona"

print("="*70)
print("Testing /generate-project-interview endpoint")
print("="*70)

try:
    print(f"\n1. Testing health check...")
    health_response = requests.get(f"{FASTAPI_URL}/health")
    print(f"   Status: {health_response.status_code}")
    print(f"   Response: {json.dumps(health_response.json(), indent=2)}")
    
    print(f"\n2. Calling /generate-project-interview...")
    print(f"   Repository: {TEST_REPO}")
    
    response = requests.post(
        f"{FASTAPI_URL}/generate-project-interview",
        json={"repo_url": TEST_REPO},
        timeout=45
    )
    
    print(f"\n3. Response received:")
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success!")
        print(f"\n   Repo Name: {data.get('repo_name')}")
        print(f"   Analyzed Files: {len(data.get('analyzed_files', []))}")
        print(f"   Number of Questions: {len(data.get('questions', []))}")
        
        # Check if fallback was used
        if 'note' in data:
            print(f"\n   ⚠️  WARNING: Using fallback questions")
            print(f"   Note: {data['note']}")
        else:
            print(f"\n   ✓ Repository-specific questions generated!")
        
        print(f"\n4. Sample Questions:")
        for i, q in enumerate(data.get('questions', [])[:3], 1):
            print(f"\n   Q{i}. {q.get('question', 'N/A')[:100]}...")
            print(f"       Category: {q.get('category')}, Difficulty: {q.get('difficulty')}")
    else:
        print(f"   ❌ Error: {response.status_code}")
        print(f"   Response: {response.text}")

except requests.exceptions.Timeout:
    print("❌ Request timed out (>45 seconds)")
except requests.exceptions.ConnectionError:
    print("❌ Connection error - Is FastAPI running on port 8000?")
except Exception as e:
    print(f"❌ Error: {str(e)}")

print("\n" + "="*70)
print("Check the uvicorn terminal for detailed logs!")
print("="*70)
