import requests
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

def fetch_movies(api_url):
    response = requests.get(api_url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch data from {api_url}: {response.status_code}: {response.text}")
        return None

def fetch_movies_page(api_key, page):
    api_url = f"https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key={api_key}&page={page}"
    return fetch_movies(api_url)

def fetch_all_movies():
    api_key = "04c35731a5ee918f014970082a0088b1"
    max_pages = 500
    all_movies = []
    
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(fetch_movies_page, api_key, page) for page in range(1, max_pages + 1)]
        for future in as_completed(futures):
            movies = future.result()
            if movies and 'results' in movies:
                all_movies.extend(movies['results'])

    end_time = time.time()
    total_time = end_time - start_time
    print(f"Total time taken: {total_time:.2f} seconds")
    print(f"Fetched page, total movies fetched: {len(all_movies)}")

    with open('all_movies.json', 'w') as json_file:
        json.dump(all_movies, json_file, separators=(',', ':'))

    print("All movies data saved to all_movies.json")

if __name__ == "__main__":
    fetch_all_movies()
