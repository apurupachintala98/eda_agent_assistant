import requests
import json
from loguru import logger
import logging

# Define the API endpoint URL
#rl = "https://sfassist.edagenaidev.awsdns.internal.das/api/cortex/complete/"
url = "http://10.126.192.122:8100/api/cortex/complete/"
update_url = "http://10.126.192.122:8100/update_feedback/"


# Load configuration from JSON file
def load_config(file_path):
    """Load configuration from a JSON file."""
    with open(file_path) as config_file:
        return json.load(config_file)

# Load configuration
config = load_config('config.json')
logger.info(f"Config: {config}")

# Extract configuration values
#aplctn_cd = config['aplctn_cd']
app_id = config['app_id']
app_id_api_key = config['app_id_api_key']
method = config['method']
model_id = config['model']
sys_msg = config['sys_msg']
limit_convs = config['limit_convs']

# Define the API request headers
headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json'
}

# Define the function to execute the backend API request
def exec_backend_func(payload):
    """
    Execute the backend API request with the given payload.

    Args:
        payload (dict): The payload to send with the API request.

    Returns:
        dict: The response from the API request.
    """
    try:
        print("Initial Payload", payload)
        #payload = json.loads(payload)
        # Add configuration values to the payload
        payload['app_id'] = app_id
        payload['app_id_api_key'] = app_id_api_key
        payload['method'] = method
        payload['model'] = model_id
        payload['sys_msg'] = sys_msg
        payload['limit_convs'] = limit_convs

        logger.info("Final payload: {}".format(payload))

        # Send the API request
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()  # Raise an exception for HTTP errors

        # Parse the response as JSON
        response_json = response.json()
        print(response_json)
        return response_json
    except Exception as e:
        logger.error(e)

def exec_update_fdbk(payload):
    try:
        logger.info(f"Requested Updated Values : {payload}")
        # Send the API request
        response = requests.post(update_url, headers=headers, json=payload)
        response.raise_for_status()  # Raise an exception for HTTP errors

        # Parse the response as JSON
        response_json = response.json()
        logger.info("Response: {}".format(response_json))
        return response_json
    except Exception as e:
        logger.error(e)
    
# #Example usage
# if __name__ == "__main__":
#     payload = {
#         "aplctn_cd": "aedldocai",
#         "user_id":"abc",
#         "prompt": "Capital city of France in detail?"
#     }
#     exec_backend_func(payload)