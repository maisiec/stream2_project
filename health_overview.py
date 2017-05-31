from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json

app = Flask(__name__)


MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'fitbitData'
COLLECTION_NAME = 'activityMay', 'heartRateMay', 'sleepDataMay'  # is this correct to have more than one collection
                                                                 #  or do they need to be combined.



@app.route("/")
def index():
    """
    A Flask view to serve the main dashboard page. 
    """
    return render_template("index.html")

@app.route("/fitbitData/") # No sure what I should put after the second / as I have 3 collections
def health_overview():
    """
    A Flask view to serve the project data from
    MongoDB in JSON format
    """

    # A constant that define the record fields that we wish to retrieve
    FIELDS = {
        "_id": False,
        "Activities": True,
        "CALORIES": True,
        "STEPS": True,
        "DISTANCE": True,
        "FLOORS": True,
        "ACTIVITY CALORIES": True
    }

    # Open a connection to MongoDB using a with statement such that the
    # connection will be closed as soon as we exit the with statement
    with MongoClient(MONGODB_HOST, MONGODB_PORT) as conn:
        # Define which collection we wish to access
        collection = conn['fitbitData']['']   # again not sure what I would need to put here.
        # Retrieve a result set only with the fields defined in FIELDS
        # and limit the the results to 55000
        projects = collection.find(projection=FIELDS, limit=55000)
        # Convert projects to a list in a JSON object and return the JSON data
        return json.dumps(list(projects))

if __name__ == '__main__':
    app.run(debug=True)
