# Data Services Orchestration
Data Services Orchestration: Cloud Functions & GCP Bucket Automation

Creation of a file upload, search and processing service. Automating the creation and configuration of this service using **terraform** and **docker**

This service will be hosted on the cloud (Google Cloud) and will use the cloud functions and Buckets (Clound Storage) to perform the required tasks.

We are supposed to implement the following requirement

![image](https://user-images.githubusercontent.com/114408910/206791199-a6408e11-2ac2-4446-8f27-a1a76ee03844.png)

## Architecture


## Automation Strategy


## Cloud Functions

On créera 3 cloud functions qui prendront en charge pour chacune d'elles ce qui suit : 

* La recherche et le téléchargement d'une image
* Le filtrage et la détection des images offensives
* Le téléchargement d'une image vers le cloud

Les propriétés de chaque function sont comme suivant (figurant dans la capture d'écran en dessous) : 

<table>
    <tr>
        <th>Propriété</th> 
        <th>Valeur</th> 
    </tr>
    <tr>
        <td>Environment</td>
        <td>1st Generation</td>
    </tr>
    <tr>
        <td>Region</td> 
        <td>us-central1</td> 
    </tr>
    <tr>
        <td>Nom</td>
        <td>orc-http-image-{search, detect, upload}</td>
    </tr>
    <tr>
        <td>Trigger</td>
        <td>HTTP</td>
    </tr>
    <tr>
        <td>Authentification</td>
        <td>Sans (pour vous faciliter l'intéraction avec les c-functions)</td>
    </tr>
    <tr>
        <td>HTTPS</td>
        <td>Non (pour simplifier nos l'envoie des requetes)</td>
    </tr>
    <tr>
        <td>Langage Programmation</td>
        <td>Nodejs (JS)</td>
    </tr>
</table>

Screenshot du GCP

![image](https://user-images.githubusercontent.com/114408910/210252286-b4f5b917-8495-4ae1-8dbc-b1c4c48eac35.png)

<table>
    <tr>
        <th>C-Function</th> 
        <th>Trigger URL</th> 
    </tr>
    <tr>
        <td>Search Function</td> 
        <td><a>https://us-central1-orchestration-gcp-episen.cloudfunctions.net/orch-http-image-search</a></td> 
    </tr>
    <tr>
        <td>Detection Function</td> 
        <td><a>https://us-central1-orchestration-gcp-episen.cloudfunctions.net/orch-http-image-detect</a></td> 
    </tr>
    <tr>
        <td>Upload Function</td> 
        <td><a>https://us-central1-orchestration-gcp-episen.cloudfunctions.net/orch-http-image-upload</a></td> 
    </tr>
</table>