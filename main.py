import json
import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

def fetch_trailer(movie_title):
    search_query = f"{movie_title} trailer"
    url = f"https://www.youtube.com/results?search_query={search_query}"
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        # Cari elemen script yang berisi JSON dengan informasi video
        scripts = soup.find_all('script')
        for script in scripts:
            if 'var ytInitialData' in script.text:
                json_text = script.text.strip().replace('var ytInitialData =', '').rstrip(';')
                data = json.loads(json_text)
                video_data = data['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents']
                for item in video_data:
                    if 'videoRenderer' in item:
                        video_id = item['videoRenderer']['videoId']
                        return f"https://www.youtube.com/embed/{video_id}"
    return None

def main():
    start_time = time.time()
    with open('all_movies.json', 'r') as json_file:
        all_movies = json.load(json_file)
    
    trailer_data = []
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(fetch_trailer, movie['title']): movie for movie in all_movies}
        for future in as_completed(futures):
            movie = futures[future]
            movie_id = movie['id']
            movie_title = movie['title']
            try:
                trailer_url = future.result()
                if trailer_url:
                    trailer_data.append({
                        'title': movie_title,
                        movie_id: trailer_url
                    })
                else:
                    print(f"Trailer not found for movie: {movie_title} (ID: {movie_id})")
            except Exception as e:
                print(f"Error fetching trailer for movie: {movie_title} (ID: {movie_id}): {e}")


    with open('trailer_data.json', 'w') as json_file:
        json.dump(trailer_data, json_file, separators=(',', ':'))

    end_time = time.time()
    total_time = end_time - start_time
    print(f"Total time taken: {total_time:.2f} seconds")
    print("Trailer data saved to trailer_data.json")


if __name__ == "__main__":
    main()
