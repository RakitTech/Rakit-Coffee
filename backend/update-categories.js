

const API_BASE_URL = 'http://localhost:3001/api';

const categories = [
  "Camilan",
  "Kopi",
  "Main Course",
  "Makanan",
  "Milk Series",
  "Non-Coffee",
  "Pizza Series",
  "Signature"
];

async function updateCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categories)
    });
    
    if (!res.ok) {
      console.error('Failed:', await res.text());
      return;
    }
    
    console.log('Categories updated successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateCategories();
