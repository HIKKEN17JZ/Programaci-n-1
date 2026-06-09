import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Gestor.settings')
django.setup()
from django.urls import reverse
try:
    print(reverse('register'))
    print("SUCCESS")
except Exception as e:
    print(f"FAILURE: {e}")
