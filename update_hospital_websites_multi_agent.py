import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
import time
import random
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import logging

# Initialize Supabase client
url: str = "https://kcklbzeaocexdwhcsiat.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtja2xiemVhb2NleGR3aGNzaWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk3NzI3MTksImV4cCI6MjAzNTM0ODcxOX0.T7ooLFl6wuHF9FYlaVInWk4_ctvgpjjy7Q2trqiSkOM"
supabase: Client = create_client(url, key)

# Configure logging
logging.basicConfig(filename='hospital_update.log', level=logging.DEBUG, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Also print logs to console
console = logging.StreamHandler()
console.setLevel(logging.DEBUG)
logging.getLogger('').addHandler(console)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0"
]

def get_first_google_result(query, user_agent):
    headers = {"User-Agent": user_agent}
    url = f"https://www.google.com/search?q={query}"
    
    try:
        logging.debug(f"Sending request for query: {query}")
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        search_results = soup.select('.yuRUbf > a')
        if search_results:
            result = search_results[0]['href']
            logging.debug(f"Found result: {result}")
            return result
        else:
            logging.warning(f"No search results found for query: {query}")
    except requests.RequestException as e:
        logging.error(f"Request failed for query '{query}': {str(e)}")
    
    return None

def update_hospital_chunk(hospitals, chunk_id):
    updated_count = 0
    for hospital in tqdm(hospitals, desc=f"Chunk {chunk_id}", position=chunk_id):
        query = f"{hospital['organization_name']} {hospital['city']} {hospital['state']} hospital website"
        user_agent = random.choice(USER_AGENTS)
        
        website = get_first_google_result(query, user_agent)
        
        if website:
            try:
                logging.debug(f"Updating database for hospital ID {hospital['id']}")
                result = supabase.table("June_cigna_combined_table").update({"website": website}).eq("id", hospital['id']).execute()
                if result.data:
                    updated_count += 1
                    logging.info(f"Updated website for hospital ID {hospital['id']}: {website}")
                else:
                    logging.warning(f"No rows updated for hospital ID {hospital['id']}")
            except Exception as e:
                logging.error(f"Failed to update database for hospital ID {hospital['id']}: {str(e)}")
        else:
            logging.warning(f"No website found for hospital ID {hospital['id']}")
        
        time.sleep(random.uniform(1, 3))
    
    return updated_count

def update_hospital_websites(num_agents=4):
    try:
        logging.info("Fetching hospitals without websites")
        response = supabase.table("June_cigna_combined_table").select("*").is_('website', 'null').execute()
        hospitals = response.data
        logging.info(f"Found {len(hospitals)} hospitals without websites")

        if not hospitals:
            logging.warning("No hospitals found without websites. Exiting.")
            return

        chunk_size = max(1, len(hospitals) // num_agents)
        hospital_chunks = [hospitals[i:i + chunk_size] for i in range(0, len(hospitals), chunk_size)]

        total_updated = 0
        with ThreadPoolExecutor(max_workers=num_agents) as executor:
            future_to_chunk = {executor.submit(update_hospital_chunk, chunk, i): i for i, chunk in enumerate(hospital_chunks)}
            
            for future in tqdm(as_completed(future_to_chunk), total=len(future_to_chunk), desc="Overall Progress"):
                chunk_id = future_to_chunk[future]
                try:
                    chunk_updated = future.result()
                    total_updated += chunk_updated
                    logging.info(f"Chunk {chunk_id} completed. Updated {chunk_updated} hospitals.")
                except Exception as e:
                    logging.error(f"Error in chunk {chunk_id}: {str(e)}")

        logging.info(f"Updated {total_updated} hospital websites using {num_agents} agents.")
        print(f"Updated {total_updated} hospital websites using {num_agents} agents.")

    except Exception as e:
        logging.error(f"An error occurred in the main function: {str(e)}")

if __name__ == "__main__":
    update_hospital_websites(num_agents=1)